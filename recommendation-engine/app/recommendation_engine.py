import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
import asyncio
import json
import math

from .models import RecommendationItem, UserProfile, RecommendationType
from .database import DatabaseManager

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.scaler = StandardScaler()
        
        # Personality traits (Big 5)
        self.personality_traits = [
            'openness', 'conscientiousness', 'extraversion', 
            'agreeableness', 'neuroticism'
        ]
        
        # Interest categories with weights
        self.interest_categories = {
            'technology': ['coding', 'programming', 'ai', 'tech', 'software', 'hardware'],
            'sports': ['football', 'cricket', 'basketball', 'tennis', 'gym', 'fitness'],
            'arts': ['music', 'painting', 'photography', 'dance', 'theater', 'design'],
            'academics': ['research', 'science', 'mathematics', 'physics', 'chemistry'],
            'social': ['parties', 'networking', 'events', 'socializing', 'friends'],
            'travel': ['travel', 'adventure', 'exploration', 'hiking', 'trekking'],
            'food': ['cooking', 'food', 'restaurants', 'cuisine', 'baking'],
            'entertainment': ['movies', 'tv', 'gaming', 'books', 'reading', 'anime']
        }
        
        # Compatibility weights for different recommendation types
        self.weights = {
            'friends': {
                'interests': 0.35,
                'personality': 0.25,
                'lifestyle': 0.20,
                'academic': 0.15,
                'activity': 0.05
            },
            'dating': {
                'interests': 0.25,
                'personality': 0.30,
                'lifestyle': 0.25,
                'physical_preferences': 0.15,
                'activity': 0.05
            },
            'daily_match': {
                'interests': 0.30,
                'personality': 0.25,
                'lifestyle': 0.20,
                'novelty': 0.15,
                'activity': 0.10
            }
        }
    
    async def initialize(self):
        """Initialize the recommendation engine"""
        logger.info("Recommendation engine initialized")
    
    async def get_recommendations(
        self,
        user_id: str,
        recommendation_type: RecommendationType,
        limit: int = 10,
        filters: Optional[Dict] = None
    ) -> List[RecommendationItem]:
        """
        Generate personalized recommendations for a user
        """
        try:
            # Get user profile
            user_profile = await self.db.get_user_profile(user_id)
            if not user_profile:
                raise ValueError(f"User {user_id} not found")
            
            # Get potential matches
            exclude_ids = filters.get('exclude_user_ids', []) if filters else []
            candidates = await self.db.get_potential_matches(
                user_id, 
                recommendation_type.value,
                limit * 3,  # Get more candidates for better selection
                exclude_ids
            )
            
            if not candidates:
                return []
            
            # Calculate compatibility scores
            recommendations = []
            for candidate in candidates:
                try:
                    compatibility_data = await self._calculate_compatibility(
                        user_profile, 
                        candidate, 
                        recommendation_type
                    )
                    
                    if compatibility_data['score'] > 0.3:  # Minimum threshold
                        recommendations.append(RecommendationItem(
                            user_id=candidate['id'],
                            compatibility_score=compatibility_data['score'],
                            match_reasons=compatibility_data['reasons'],
                            common_interests=compatibility_data['common_interests'],
                            personality_match=compatibility_data['personality_match'],
                            explanation=compatibility_data['explanation'],
                            confidence=compatibility_data['confidence']
                        ))
                except Exception as e:
                    logger.warning(f"Error calculating compatibility for user {candidate['id']}: {e}")
                    continue
            
            # Sort by compatibility score and apply diversity
            recommendations = self._apply_diversity_filter(recommendations, user_profile)
            
            # Return top recommendations
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            raise
    
    async def _calculate_compatibility(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any],
        rec_type: RecommendationType
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive compatibility score between two users
        """
        scores = {}
        reasons = []
        common_interests = []
        
        # 1. Interest Similarity
        interest_score, common_ints = self._calculate_interest_similarity(user, candidate)
        scores['interests'] = interest_score
        common_interests = common_ints
        
        if interest_score > 0.7:
            reasons.append(f"Share {len(common_interests)} common interests")
        
        # 2. Personality Compatibility
        personality_score, personality_match = self._calculate_personality_compatibility(
            user, candidate, rec_type
        )
        scores['personality'] = personality_score
        
        # 3. Lifestyle Compatibility
        lifestyle_score = self._calculate_lifestyle_compatibility(user, candidate)
        scores['lifestyle'] = lifestyle_score
        
        # 4. Academic Compatibility
        academic_score = self._calculate_academic_compatibility(user, candidate)
        scores['academic'] = academic_score
        
        # 5. Activity Level Compatibility
        activity_score = self._calculate_activity_compatibility(user, candidate)
        scores['activity'] = activity_score
        
        # 6. Apply similarity preference (+1 or -1)
        similarity_preference = self._get_similarity_preference(user, rec_type)
        if similarity_preference == -1:
            # User wants opposites - invert some scores
            scores['personality'] = 1.0 - scores['personality']
            scores['lifestyle'] = 1.0 - scores['lifestyle']
            reasons.append("Complementary personalities detected")
        
        # 7. Check dealbreakers
        dealbreaker_penalty = self._check_dealbreakers(user, candidate)
        
        # Calculate weighted final score
        weights = self.weights.get(rec_type.value, self.weights['friends'])
        final_score = sum(scores[key] * weights.get(key, 0) for key in scores)
        final_score *= (1.0 - dealbreaker_penalty)  # Apply dealbreaker penalty
        
        # Generate explanation
        explanation = self._generate_explanation(scores, reasons, rec_type)
        
        # Calculate confidence based on data completeness
        confidence = self._calculate_confidence(user, candidate, scores)
        
        return {
            'score': max(0.0, min(1.0, final_score)),
            'reasons': reasons,
            'common_interests': common_interests,
            'personality_match': personality_match,
            'explanation': explanation,
            'confidence': confidence,
            'detailed_scores': scores
        }
    
    def _calculate_interest_similarity(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any]
    ) -> Tuple[float, List[str]]:
        """Calculate interest-based similarity"""
        user_interests = set(user.get('interests', []))
        candidate_interests = set(candidate.get('interests', []))
        
        if not user_interests or not candidate_interests:
            return 0.0, []
        
        # Find common interests
        common = user_interests.intersection(candidate_interests)
        union = user_interests.union(candidate_interests)
        
        # Jaccard similarity
        jaccard_score = len(common) / len(union) if union else 0.0
        
        # Category-based similarity
        user_categories = self._get_interest_categories(user_interests)
        candidate_categories = self._get_interest_categories(candidate_interests)
        
        category_overlap = len(user_categories.intersection(candidate_categories))
        category_score = category_overlap / max(len(user_categories), len(candidate_categories), 1)
        
        # Combined score
        final_score = 0.6 * jaccard_score + 0.4 * category_score
        
        return final_score, list(common)
    
    def _calculate_personality_compatibility(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any],
        rec_type: RecommendationType
    ) -> Tuple[float, Dict[str, float]]:
        """Calculate personality-based compatibility"""
        user_personality = user.get('personality_traits', {})
        candidate_personality = candidate.get('personality_traits', {})
        
        if not user_personality or not candidate_personality:
            # Use default personality estimation based on interests and behavior
            user_personality = self._estimate_personality(user)
            candidate_personality = self._estimate_personality(candidate)
        
        compatibility_scores = {}
        
        for trait in self.personality_traits:
            user_score = user_personality.get(trait, 0.5)
            candidate_score = candidate_personality.get(trait, 0.5)
            
            if rec_type == RecommendationType.DATING:
                # For dating, some traits work better when complementary
                if trait in ['extraversion', 'openness']:
                    # Similar is better
                    compatibility_scores[trait] = 1.0 - abs(user_score - candidate_score)
                else:
                    # Slightly different can be good
                    diff = abs(user_score - candidate_score)
                    compatibility_scores[trait] = 1.0 - (diff * 0.7)
            else:
                # For friends, similarity is generally better
                compatibility_scores[trait] = 1.0 - abs(user_score - candidate_score)
        
        avg_compatibility = sum(compatibility_scores.values()) / len(compatibility_scores)
        
        return avg_compatibility, compatibility_scores
    
    def _calculate_lifestyle_compatibility(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any]
    ) -> float:
        """Calculate lifestyle compatibility"""
        score = 0.0
        factors = 0
        
        # Food preferences
        user_food = user.get('food_preference')
        candidate_food = candidate.get('food_preference')
        
        if user_food and candidate_food:
            if user_food == candidate_food:
                score += 1.0
            elif self._are_food_preferences_compatible(user_food, candidate_food):
                score += 0.7
            else:
                score += 0.3
            factors += 1
        
        # Smoking compatibility
        user_smoking = user.get('smoking')
        candidate_smoking = candidate.get('smoking')
        
        if user_smoking and candidate_smoking:
            smoking_compatibility = self._calculate_smoking_compatibility(user_smoking, candidate_smoking)
            score += smoking_compatibility
            factors += 1
        
        # Drinking compatibility
        user_drinking = user.get('drinking')
        candidate_drinking = candidate.get('drinking')
        
        if user_drinking and candidate_drinking:
            drinking_compatibility = self._calculate_drinking_compatibility(user_drinking, candidate_drinking)
            score += drinking_compatibility
            factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _calculate_academic_compatibility(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any]
    ) -> float:
        """Calculate academic compatibility"""
        score = 0.0
        
        # Same campus bonus
        if user.get('campus') == candidate.get('campus'):
            score += 0.4
        
        # Year compatibility (closer years = higher score)
        user_year = user.get('year', 1)
        candidate_year = candidate.get('year', 1)
        year_diff = abs(user_year - candidate_year)
        year_score = max(0, 1.0 - (year_diff * 0.2))
        score += year_score * 0.3
        
        # Branch compatibility (same branch = bonus, different = diversity)
        if user.get('branch') == candidate.get('branch'):
            score += 0.2
        else:
            score += 0.1  # Diversity bonus
        
        # Response rate compatibility
        user_response_rate = user.get('response_rate', 0.5)
        candidate_response_rate = candidate.get('response_rate', 0.5)
        response_compatibility = 1.0 - abs(user_response_rate - candidate_response_rate)
        score += response_compatibility * 0.1
        
        return min(1.0, score)
    
    def _calculate_activity_compatibility(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any]
    ) -> float:
        """Calculate activity level compatibility"""
        user_last_seen = user.get('last_seen')
        candidate_last_seen = candidate.get('last_seen')
        
        if not user_last_seen or not candidate_last_seen:
            return 0.5
        
        # Convert to datetime if string
        if isinstance(user_last_seen, str):
            user_last_seen = datetime.fromisoformat(user_last_seen.replace('Z', '+00:00'))
        if isinstance(candidate_last_seen, str):
            candidate_last_seen = datetime.fromisoformat(candidate_last_seen.replace('Z', '+00:00'))
        
        now = datetime.utcnow()
        user_days_ago = (now - user_last_seen).days
        candidate_days_ago = (now - candidate_last_seen).days
        
        # Both active recently = high score
        if user_days_ago <= 1 and candidate_days_ago <= 1:
            return 1.0
        elif user_days_ago <= 7 and candidate_days_ago <= 7:
            return 0.8
        elif user_days_ago <= 30 and candidate_days_ago <= 30:
            return 0.6
        else:
            return 0.3
    
    def _get_similarity_preference(self, user: Dict[str, Any], rec_type: RecommendationType) -> int:
        """Get user's similarity preference (+1 or -1)"""
        preferences = user.get('preferences', {})
        
        if rec_type == RecommendationType.DATING:
            return preferences.get('dating_similarity', 1)
        else:
            return preferences.get('connect_similarity', 1)
    
    def _check_dealbreakers(self, user: Dict[str, Any], candidate: Dict[str, Any]) -> float:
        """Check for dealbreakers and return penalty (0.0 to 1.0)"""
        dealbreakers = user.get('preferences', {}).get('dealbreakers', {})
        penalty = 0.0
        
        # Smoking dealbreaker
        if dealbreakers.get('no_smoking') and candidate.get('smoking') in ['regularly', 'socially']:
            penalty += 0.8
        
        # Food preference dealbreaker
        if dealbreakers.get('food_preference'):
            required_food = dealbreakers['food_preference']
            candidate_food = candidate.get('food_preference')
            if candidate_food and candidate_food != required_food:
                penalty += 0.6
        
        # Age dealbreaker
        age_range = user.get('preferences', {}).get('age_range', [18, 30])
        candidate_age = candidate.get('age')
        if candidate_age and (candidate_age < age_range[0] or candidate_age > age_range[1]):
            penalty += 1.0  # Hard dealbreaker
        
        return min(1.0, penalty)
    
    def _get_interest_categories(self, interests: set) -> set:
        """Map interests to categories"""
        categories = set()
        for interest in interests:
            for category, keywords in self.interest_categories.items():
                if any(keyword in interest.lower() for keyword in keywords):
                    categories.add(category)
        return categories
    
    def _estimate_personality(self, user: Dict[str, Any]) -> Dict[str, float]:
        """Estimate personality traits based on available data"""
        personality = {}
        interests = user.get('interests', [])
        
        # Rough estimation based on interests
        tech_interests = len([i for i in interests if any(t in i.lower() for t in ['tech', 'coding', 'programming'])])
        social_interests = len([i for i in interests if any(s in i.lower() for s in ['party', 'social', 'friends'])])
        creative_interests = len([i for i in interests if any(c in i.lower() for c in ['art', 'music', 'creative'])])
        
        personality['openness'] = min(1.0, (creative_interests + tech_interests) * 0.2 + 0.3)
        personality['extraversion'] = min(1.0, social_interests * 0.3 + 0.2)
        personality['conscientiousness'] = 0.5  # Default
        personality['agreeableness'] = 0.6  # Default slightly positive
        personality['neuroticism'] = 0.4  # Default slightly low
        
        return personality
    
    def _are_food_preferences_compatible(self, pref1: str, pref2: str) -> bool:
        """Check if food preferences are compatible"""
        compatible_pairs = {
            ('vegetarian', 'vegan'),
            ('vegetarian', 'jain'),
            ('vegan', 'jain'),
            ('non_vegetarian', 'eggetarian')
        }
        return (pref1, pref2) in compatible_pairs or (pref2, pref1) in compatible_pairs
    
    def _calculate_smoking_compatibility(self, smoking1: str, smoking2: str) -> float:
        """Calculate smoking habit compatibility"""
        compatibility_matrix = {
            ('never', 'never'): 1.0,
            ('never', 'trying_to_quit'): 0.8,
            ('never', 'socially'): 0.3,
            ('never', 'regularly'): 0.1,
            ('socially', 'socially'): 1.0,
            ('socially', 'regularly'): 0.7,
            ('regularly', 'regularly'): 1.0,
            ('trying_to_quit', 'trying_to_quit'): 1.0,
        }
        
        return compatibility_matrix.get((smoking1, smoking2), 
                                      compatibility_matrix.get((smoking2, smoking1), 0.5))
    
    def _calculate_drinking_compatibility(self, drinking1: str, drinking2: str) -> float:
        """Calculate drinking habit compatibility"""
        compatibility_matrix = {
            ('never', 'never'): 1.0,
            ('never', 'occasionally'): 0.7,
            ('never', 'socially'): 0.4,
            ('never', 'regularly'): 0.2,
            ('occasionally', 'occasionally'): 1.0,
            ('occasionally', 'socially'): 0.9,
            ('socially', 'socially'): 1.0,
            ('socially', 'regularly'): 0.8,
            ('regularly', 'regularly'): 1.0,
        }
        
        return compatibility_matrix.get((drinking1, drinking2),
                                      compatibility_matrix.get((drinking2, drinking1), 0.5))
    
    def _generate_explanation(
        self, 
        scores: Dict[str, float], 
        reasons: List[str],
        rec_type: RecommendationType
    ) -> str:
        """Generate human-readable explanation for the match"""
        explanations = []
        
        if scores.get('interests', 0) > 0.7:
            explanations.append("Strong interest alignment")
        elif scores.get('interests', 0) > 0.5:
            explanations.append("Good interest compatibility")
        
        if scores.get('personality', 0) > 0.7:
            explanations.append("Excellent personality match")
        elif scores.get('personality', 0) > 0.5:
            explanations.append("Compatible personalities")
        
        if scores.get('lifestyle', 0) > 0.7:
            explanations.append("Similar lifestyle preferences")
        
        if scores.get('academic', 0) > 0.7:
            explanations.append("Great academic compatibility")
        
        if not explanations:
            explanations.append("Potential for good connection")
        
        return " • ".join(explanations)
    
    def _calculate_confidence(
        self, 
        user: Dict[str, Any], 
        candidate: Dict[str, Any],
        scores: Dict[str, float]
    ) -> float:
        """Calculate confidence in the recommendation"""
        confidence_factors = []
        
        # Data completeness
        user_completeness = self._calculate_profile_completeness(user)
        candidate_completeness = self._calculate_profile_completeness(candidate)
        confidence_factors.append((user_completeness + candidate_completeness) / 2)
        
        # Score consistency
        score_variance = np.var(list(scores.values()))
        consistency_score = max(0, 1.0 - score_variance)
        confidence_factors.append(consistency_score)
        
        # Activity level
        activity_score = scores.get('activity', 0.5)
        confidence_factors.append(activity_score)
        
        return sum(confidence_factors) / len(confidence_factors)
    
    def _calculate_profile_completeness(self, user: Dict[str, Any]) -> float:
        """Calculate how complete a user's profile is"""
        required_fields = ['display_name', 'age', 'bio', 'interests', 'preferences']
        optional_fields = ['food_preference', 'smoking', 'drinking']
        
        completeness = 0.0
        
        # Required fields (70% weight)
        for field in required_fields:
            if user.get(field):
                if field == 'interests' and len(user[field]) >= 3:
                    completeness += 0.14  # 70% / 5 fields
                elif field == 'bio' and len(user[field]) >= 50:
                    completeness += 0.14
                elif field not in ['interests', 'bio']:
                    completeness += 0.14
        
        # Optional fields (30% weight)
        for field in optional_fields:
            if user.get(field):
                completeness += 0.10  # 30% / 3 fields
        
        return min(1.0, completeness)
    
    def _apply_diversity_filter(
        self, 
        recommendations: List[RecommendationItem], 
        user_profile: Dict[str, Any]
    ) -> List[RecommendationItem]:
        """Apply diversity to avoid too similar recommendations"""
        if len(recommendations) <= 5:
            return sorted(recommendations, key=lambda x: x.compatibility_score, reverse=True)
        
        # Sort by score first
        recommendations.sort(key=lambda x: x.compatibility_score, reverse=True)
        
        # Apply diversity - ensure variety in top recommendations
        diverse_recs = []
        used_branches = set()
        used_campuses = set()
        
        for rec in recommendations:
            # Always include top 3 regardless of diversity
            if len(diverse_recs) < 3:
                diverse_recs.append(rec)
                continue
            
            # For remaining slots, prefer diversity
            # This would require additional user data fetching
            # For now, just return sorted by score
            diverse_recs.append(rec)
        
        return diverse_recs
    
    async def record_feedback(
        self, 
        user_id: str, 
        target_user_id: str, 
        action: str
    ):
        """Record user feedback for improving recommendations"""
        await self.db.record_feedback(user_id, target_user_id, action)
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user recommendation statistics"""
        return await self.db.get_user_stats(user_id)