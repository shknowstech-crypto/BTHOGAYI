from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class RecommendationType(str, Enum):
    FRIENDS = "friends"
    DATING = "dating"
    DAILY_MATCH = "daily_match"
    SIMILAR = "similar"
    OPPOSITE = "opposite"

class GenderType(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class CampusType(str, Enum):
    PILANI = "Pilani"
    GOA = "Goa"
    HYDERABAD = "Hyderabad"
    DUBAI = "Dubai"

class FoodPreference(str, Enum):
    VEG = "vegetarian"
    NON_VEG = "non_vegetarian"
    VEGAN = "vegan"
    JAIN = "jain"
    EGGETARIAN = "eggetarian"

class SmokingPreference(str, Enum):
    NEVER = "never"
    SOCIALLY = "socially"
    REGULARLY = "regularly"
    TRYING_TO_QUIT = "trying_to_quit"

class DrinkingPreference(str, Enum):
    NEVER = "never"
    SOCIALLY = "socially"
    REGULARLY = "regularly"
    OCCASIONALLY = "occasionally"

class UserPreferences(BaseModel):
    age_range: List[int] = Field(default=[18, 30], min_items=2, max_items=2)
    gender_preference: Optional[GenderType] = None
    max_distance: int = Field(default=50, ge=1, le=1000)
    connect_similarity: Literal[1, -1] = 1  # +1 for similar, -1 for opposite
    dating_similarity: Literal[1, -1] = 1
    looking_for: List[str] = Field(default=["friends"])
    
    # Dealbreakers
    dealbreakers: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('age_range')
    def validate_age_range(cls, v):
        if len(v) != 2 or v[0] >= v[1]:
            raise ValueError('Age range must be [min_age, max_age] with min < max')
        return v

class UserProfile(BaseModel):
    id: str
    display_name: str
    age: Optional[int] = None
    gender: Optional[GenderType] = None
    campus: CampusType
    year: int = Field(ge=1, le=5)
    branch: str
    bio: Optional[str] = None
    
    # Enhanced attributes
    interests: List[str] = Field(default_factory=list)
    personality_traits: Dict[str, float] = Field(default_factory=dict)  # Big 5 personality
    lifestyle: Dict[str, Any] = Field(default_factory=dict)
    
    # Preferences
    food_preference: Optional[FoodPreference] = None
    smoking: Optional[SmokingPreference] = None
    drinking: Optional[DrinkingPreference] = None
    
    # Activity and engagement
    last_seen: datetime
    is_active: bool = True
    response_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Matching preferences
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    
    # Verification status
    verified: bool = False
    
    # Location (optional for distance calculations)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RecommendationFilters(BaseModel):
    exclude_user_ids: List[str] = Field(default_factory=list)
    min_compatibility_score: float = Field(default=0.3, ge=0.0, le=1.0)
    campus_filter: Optional[List[CampusType]] = None
    verified_only: bool = False
    active_recently: bool = True  # Active in last 7 days

class RecommendationRequest(BaseModel):
    user_id: str
    recommendation_type: RecommendationType
    limit: int = Field(default=10, ge=1, le=50)
    filters: Optional[RecommendationFilters] = None

class RecommendationItem(BaseModel):
    user_id: str
    compatibility_score: float = Field(ge=0.0, le=1.0)
    match_reasons: List[str] = Field(default_factory=list)
    common_interests: List[str] = Field(default_factory=list)
    personality_match: Dict[str, float] = Field(default_factory=dict)
    distance_km: Optional[float] = None
    
    # Explanation for the match
    explanation: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[RecommendationItem]
    algorithm_version: str = "2.0"
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    total_candidates: int = 0
    fallback_used: bool = False  # True if local algorithm was used

class UserFeedback(BaseModel):
    user_id: str
    target_user_id: str
    action: Literal["like", "pass", "super_like", "block", "report"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context: Optional[Dict[str, Any]] = None

class UserStats(BaseModel):
    user_id: str
    total_recommendations_generated: int = 0
    total_matches: int = 0
    match_rate: float = 0.0
    average_compatibility_score: float = 0.0
    top_interests: List[str] = Field(default_factory=list)
    personality_summary: Dict[str, float] = Field(default_factory=dict)