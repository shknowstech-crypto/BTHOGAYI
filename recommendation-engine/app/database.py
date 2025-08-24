import asyncpg
import os
from typing import List, Dict, Any, Optional
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool = None
        self.database_url = os.getenv("DATABASE_URL")
        
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
    async def connect(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10,
                command_timeout=60,
                server_settings={
                    'application_name': 'bitspark_recommendation_engine'
                }
            )
            logger.info("Database connection pool created successfully")
            
            # Test connection
            async with self.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def health_check(self) -> bool:
        """Check database connection health"""
        try:
            if not self.pool:
                await self.connect()
            
            async with self.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    async def close(self):
        """Alias for disconnect for compatibility"""
        await self.disconnect()
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get complete user profile with interests and preferences"""
        if not self.pool:
            raise RuntimeError("Database not connected")
            
        async with self.pool.acquire() as conn:
            try:
                # Get user basic info with interests
                user_query = """
                    SELECT u.*, 
                           COALESCE(
                               array_agg(ui.interest) FILTER (WHERE ui.interest IS NOT NULL), 
                               ARRAY[]::text[]
                           ) as interests,
                           COALESCE(
                               array_agg(ui.weight) FILTER (WHERE ui.weight IS NOT NULL), 
                               ARRAY[]::decimal[]
                           ) as interest_weights
                    FROM users u
                    LEFT JOIN user_interests ui ON u.id = ui.user_id
                    WHERE u.id = $1 AND u.is_active = true
                    GROUP BY u.id
                """
                
                user_row = await conn.fetchrow(user_query, user_id)
                if not user_row:
                    logger.warning(f"User {user_id} not found or inactive")
                    return None
                
                # Convert to dict and process
                user_data = dict(user_row)
                
                # Process interests
                if user_data['interests'] and len(user_data['interests']) > 0 and user_data['interests'][0]:
                    interests_with_weights = list(zip(
                        user_data['interests'], 
                        user_data['interest_weights'] or [1.0] * len(user_data['interests'])
                    ))
                    user_data['interests_weighted'] = interests_with_weights
                    user_data['interests'] = [i for i in user_data['interests'] if i]
                else:
                    user_data['interests'] = []
                    user_data['interests_weighted'] = []
                
                # Parse JSON fields safely
                if user_data.get('preferences'):
                    if isinstance(user_data['preferences'], str):
                        try:
                            user_data['preferences'] = json.loads(user_data['preferences'])
                        except json.JSONDecodeError:
                            logger.warning(f"Invalid preferences JSON for user {user_id}")
                            user_data['preferences'] = {}
                
                logger.info(f"Retrieved profile for user {user_id} with {len(user_data['interests'])} interests")
                return user_data
                
            except Exception as e:
                logger.error(f"Error fetching user profile {user_id}: {e}")
                return None
    
    async def get_potential_matches(
        self, 
        user_id: str, 
        recommendation_type: str,
        limit: int = 50,
        exclude_ids: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Get potential matches for a user with enhanced filtering"""
        if not self.pool:
            raise RuntimeError("Database not connected")
            
        exclude_ids = exclude_ids or []
        exclude_ids.append(user_id)  # Always exclude self
        
        async with self.pool.acquire() as conn:
            try:
                # Get user's campus for filtering
                user_campus_query = "SELECT campus FROM users WHERE id = $1"
                user_campus = await conn.fetchval(user_campus_query, user_id)
                
                if not user_campus:
                    logger.warning(f"User {user_id} not found for campus lookup")
                    return []
                
                # Enhanced query with better filtering
                query = """
                    SELECT DISTINCT u.*, 
                           COALESCE(
                               array_agg(ui.interest) FILTER (WHERE ui.interest IS NOT NULL), 
                               ARRAY[]::text[]
                           ) as interests,
                           COALESCE(
                               array_agg(ui.weight) FILTER (WHERE ui.weight IS NOT NULL), 
                               ARRAY[]::decimal[]
                           ) as interest_weights
                    FROM users u
                    LEFT JOIN user_interests ui ON u.id = ui.user_id
                    WHERE u.id != $1 
                      AND u.is_active = true
                      AND u.verified = true
                      AND u.campus = $2
                      AND u.profile_completed = true
                      AND u.id NOT IN (
                          SELECT CASE 
                              WHEN user1_id = $1 THEN user2_id 
                              ELSE user1_id 
                          END
                          FROM connections 
                          WHERE (user1_id = $1 OR user2_id = $1)
                            AND status IN ('accepted', 'pending', 'blocked')
                      )
                      AND ($3::text[] IS NULL OR u.id != ALL($3::text[]))
                      AND u.last_seen > $4
                    GROUP BY u.id
                    ORDER BY u.last_seen DESC, u.verified DESC
                    LIMIT $5
                """
                
                # Active in last 30 days
                active_since = datetime.utcnow() - timedelta(days=30)
                
                rows = await conn.fetch(
                    query, 
                    user_id,
                    user_campus,
                    exclude_ids if exclude_ids else None,
                    active_since,
                    limit * 2  # Get more candidates for better filtering
                )
                
                # Process results
                candidates = []
                for row in rows:
                    candidate = dict(row)
                    
                    # Process interests
                    if candidate['interests'] and len(candidate['interests']) > 0 and candidate['interests'][0]:
                        interests_with_weights = list(zip(
                            candidate['interests'], 
                            candidate['interest_weights'] or [1.0] * len(candidate['interests'])
                        ))
                        candidate['interests_weighted'] = interests_with_weights
                        candidate['interests'] = [i for i in candidate['interests'] if i]
                    else:
                        candidate['interests'] = []
                        candidate['interests_weighted'] = []
                    
                    # Parse JSON fields safely
                    if candidate.get('preferences'):
                        if isinstance(candidate['preferences'], str):
                            try:
                                candidate['preferences'] = json.loads(candidate['preferences'])
                            except json.JSONDecodeError:
                                candidate['preferences'] = {}
                    
                    candidates.append(candidate)
                
                logger.info(f"Found {len(candidates)} potential matches for user {user_id} (type: {recommendation_type})")
                return candidates
                
            except Exception as e:
                logger.error(f"Error fetching potential matches: {e}")
                return []
    
    async def record_feedback(
        self, 
        user_id: str, 
        target_user_id: str, 
        action: str,
        context: Dict[str, Any] = None
    ):
        """Record user feedback for improving recommendations"""
        if not self.pool:
            raise RuntimeError("Database not connected")
            
        async with self.pool.acquire() as conn:
            try:
                # Insert feedback record with upsert
                await conn.execute("""
                    INSERT INTO user_feedback (user_id, target_user_id, action, context, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (user_id, target_user_id) 
                    DO UPDATE SET 
                        action = $3,
                        context = $4,
                        created_at = $5
                """, user_id, target_user_id, action, json.dumps(context or {}), datetime.utcnow())
                
                # If it's a positive action, check for mutual match
                if action in ['like', 'super_like']:
                    mutual_match = await conn.fetchrow("""
                        SELECT * FROM user_feedback 
                        WHERE user_id = $1 AND target_user_id = $2 
                          AND action IN ('like', 'super_like')
                    """, target_user_id, user_id)
                    
                    if mutual_match:
                        # Create connection
                        await conn.execute("""
                            INSERT INTO connections (user1_id, user2_id, connection_type, status, created_at)
                            VALUES ($1, $2, 'friend', 'accepted', $3)
                            ON CONFLICT (user1_id, user2_id) DO NOTHING
                        """, user_id, target_user_id, datetime.utcnow())
                        
                        logger.info(f"Created mutual connection between {user_id} and {target_user_id}")
                
                logger.info(f"Recorded feedback: {action} from {user_id} to {target_user_id}")
                
            except Exception as e:
                logger.error(f"Error recording feedback: {e}")
                raise
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user recommendation statistics"""
        if not self.pool:
            raise RuntimeError("Database not connected")
            
        async with self.pool.acquire() as conn:
            try:
                stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(CASE WHEN action IN ('like', 'super_like') THEN 1 END) as likes_given,
                        COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes_given,
                        (SELECT COUNT(*) FROM connections WHERE user1_id = $1 OR user2_id = $1) as total_connections,
                        (SELECT AVG(compatibility_score) FROM connections WHERE user1_id = $1 OR user2_id = $1) as avg_compatibility
                    FROM user_feedback 
                    WHERE user_id = $1
                """, user_id)
                
                result = dict(stats) if stats else {}
                
                # Calculate match rate
                likes_given = result.get('likes_given', 0)
                total_connections = result.get('total_connections', 0)
                result['match_rate'] = (total_connections / likes_given) if likes_given > 0 else 0.0
                
                return result
                
            except Exception as e:
                logger.error(f"Error getting user stats: {e}")
                return {}
    
    async def update_user_activity(self, user_id: str):
        """Update user's last seen timestamp"""
        if not self.pool:
            return
            
        async with self.pool.acquire() as conn:
            try:
                await conn.execute("""
                    UPDATE users 
                    SET last_seen = $1 
                    WHERE id = $2
                """, datetime.utcnow(), user_id)
                
            except Exception as e:
                logger.warning(f"Failed to update user activity: {e}")

    async def create_user_feedback_table(self):
        """Create user_feedback table if it doesn't exist"""
        if not self.pool:
            raise RuntimeError("Database not connected")
            
        async with self.pool.acquire() as conn:
            try:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS user_feedback (
                        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id uuid NOT NULL,
                        target_user_id uuid NOT NULL,
                        action text NOT NULL CHECK (action IN ('like', 'pass', 'super_like', 'block', 'report')),
                        context jsonb DEFAULT '{}',
                        created_at timestamptz DEFAULT now(),
                        UNIQUE(user_id, target_user_id)
                    )
                """)
                
                # Create index
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id)
                """)
                
                logger.info("User feedback table created/verified")
                
            except Exception as e:
                logger.error(f"Error creating user_feedback table: {e}")
                raise