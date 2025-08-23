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
        
    async def connect(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("Database connection pool created")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get complete user profile with interests and preferences"""
        async with self.pool.acquire() as conn:
            # Get user basic info
            user_query = """
                SELECT u.*, 
                       array_agg(ui.interest) as interests,
                       array_agg(ui.weight) as interest_weights
                FROM users u
                LEFT JOIN user_interests ui ON u.id = ui.user_id
                WHERE u.id = $1 AND u.is_active = true
                GROUP BY u.id
            """
            
            user_row = await conn.fetchrow(user_query, user_id)
            if not user_row:
                return None
            
            # Convert to dict and process
            user_data = dict(user_row)
            
            # Process interests
            if user_data['interests'] and user_data['interests'][0]:
                interests_with_weights = list(zip(
                    user_data['interests'], 
                    user_data['interest_weights'] or [1.0] * len(user_data['interests'])
                ))
                user_data['interests_weighted'] = interests_with_weights
                user_data['interests'] = user_data['interests']
            else:
                user_data['interests'] = []
                user_data['interests_weighted'] = []
            
            # Parse JSON fields
            if user_data.get('preferences'):
                if isinstance(user_data['preferences'], str):
                    user_data['preferences'] = json.loads(user_data['preferences'])
            
            return user_data
    
    async def get_potential_matches(
        self, 
        user_id: str, 
        recommendation_type: str,
        limit: int = 50,
        exclude_ids: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Get potential matches for a user"""
        exclude_ids = exclude_ids or []
        exclude_ids.append(user_id)  # Always exclude self
        
        async with self.pool.acquire() as conn:
            # Get users who haven't been connected with
            query = """
                SELECT DISTINCT u.*, 
                       array_agg(ui.interest) as interests,
                       array_agg(ui.weight) as interest_weights
                FROM users u
                LEFT JOIN user_interests ui ON u.id = ui.user_id
                WHERE u.id != $1 
                  AND u.is_active = true
                  AND u.verified = true
                  AND u.id NOT IN (
                      SELECT CASE 
                          WHEN user1_id = $1 THEN user2_id 
                          ELSE user1_id 
                      END
                      FROM connections 
                      WHERE (user1_id = $1 OR user2_id = $1)
                        AND status IN ('accepted', 'pending', 'blocked')
                  )
                  AND ($2::text[] IS NULL OR u.id != ALL($2::text[]))
                  AND u.last_seen > $3
                GROUP BY u.id
                ORDER BY u.last_seen DESC
                LIMIT $4
            """
            
            # Active in last 30 days
            active_since = datetime.utcnow() - timedelta(days=30)
            
            rows = await conn.fetch(
                query, 
                user_id, 
                exclude_ids if exclude_ids else None,
                active_since,
                limit * 2  # Get more candidates for better filtering
            )
            
            # Process results
            candidates = []
            for row in rows:
                candidate = dict(row)
                
                # Process interests
                if candidate['interests'] and candidate['interests'][0]:
                    interests_with_weights = list(zip(
                        candidate['interests'], 
                        candidate['interest_weights'] or [1.0] * len(candidate['interests'])
                    ))
                    candidate['interests_weighted'] = interests_with_weights
                    candidate['interests'] = candidate['interests']
                else:
                    candidate['interests'] = []
                    candidate['interests_weighted'] = []
                
                # Parse JSON fields
                if candidate.get('preferences'):
                    if isinstance(candidate['preferences'], str):
                        candidate['preferences'] = json.loads(candidate['preferences'])
                
                candidates.append(candidate)
            
            return candidates
    
    async def record_feedback(
        self, 
        user_id: str, 
        target_user_id: str, 
        action: str,
        context: Dict[str, Any] = None
    ):
        """Record user feedback for improving recommendations"""
        async with self.pool.acquire() as conn:
            # Insert feedback record
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
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user recommendation statistics"""
        async with self.pool.acquire() as conn:
            stats = await conn.fetchrow("""
                SELECT 
                    COUNT(CASE WHEN action IN ('like', 'super_like') THEN 1 END) as likes_given,
                    COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes_given,
                    (SELECT COUNT(*) FROM connections WHERE user1_id = $1 OR user2_id = $1) as total_connections,
                    (SELECT AVG(compatibility_score) FROM connections WHERE user1_id = $1 OR user2_id = $1) as avg_compatibility
                FROM user_feedback 
                WHERE user_id = $1
            """, user_id)
            
            return dict(stats) if stats else {}
    
    async def update_user_activity(self, user_id: str):
        """Update user's last seen timestamp"""
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE users 
                SET last_seen = $1 
                WHERE id = $2
            """, datetime.utcnow(), user_id)