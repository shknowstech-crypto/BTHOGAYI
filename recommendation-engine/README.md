# BITSPARK Recommendation Engine

Advanced AI-powered recommendation system for the BITSPARK dating and social app.

## Features

- **Multi-dimensional Compatibility**: Analyzes interests, personality, lifestyle, and academic compatibility
- **Similarity Preferences**: Supports both similar (+1) and opposite (-1) matching preferences
- **Dealbreaker System**: Respects user dealbreakers for smoking, food preferences, etc.
- **Advanced Algorithms**: Uses cosine similarity, personality matching, and weighted scoring
- **Secure API**: API key authentication and CORS protection
- **Scalable Architecture**: Built with FastAPI and async/await patterns

## Compatibility Factors

### 1. Interest Similarity (25-35% weight)
- Jaccard similarity between user interests
- Category-based matching (tech, sports, arts, etc.)
- Weighted by interest importance

### 2. Personality Compatibility (25-30% weight)
- Big 5 personality traits analysis
- Different strategies for friends vs dating
- Complementary vs similar personality matching

### 3. Lifestyle Compatibility (20-25% weight)
- Food preferences (veg, non-veg, jain, vegan, etc.)
- Smoking habits compatibility
- Drinking preferences alignment

### 4. Academic Compatibility (15% weight)
- Same campus bonus
- Year proximity scoring
- Branch diversity/similarity balance

### 5. Activity Level (5-10% weight)
- Recent activity matching
- Response rate compatibility

## API Endpoints

### POST /api/v1/recommendations
Get personalized recommendations for a user.

**Request:**
```json
{
  "user_id": "user-uuid",
  "recommendation_type": "friends|dating|daily_match",
  "limit": 10,
  "filters": {
    "exclude_user_ids": ["uuid1", "uuid2"],
    "min_compatibility_score": 0.3,
    "verified_only": true
  }
}
```

**Response:**
```json
{
  "user_id": "user-uuid",
  "recommendations": [
    {
      "user_id": "match-uuid",
      "compatibility_score": 0.85,
      "match_reasons": ["Strong interest alignment", "Compatible personalities"],
      "common_interests": ["coding", "music", "travel"],
      "explanation": "Excellent personality match • Strong interest alignment",
      "confidence": 0.92
    }
  ],
  "algorithm_version": "2.0",
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### POST /api/v1/feedback
Submit user feedback to improve recommendations.

### GET /api/v1/stats/{user_id}
Get user recommendation statistics.

## Deployment on Render

1. **Create a new Web Service** on Render
2. **Connect your repository** containing the recommendation-engine folder
3. **Set build command**: `pip install -r requirements.txt`
4. **Set start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add environment variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `API_SECRET_KEY`: Generate a secure secret key
   - `API_KEY`: Generate an API key for frontend authentication
   - `ALLOWED_ORIGINS`: Your frontend domain
   - `ENVIRONMENT`: `production`

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
API_SECRET_KEY=your-super-secret-key
API_KEY=your-api-key-for-frontend
ALLOWED_ORIGINS=https://yourdomain.com

# Optional
REDIS_URL=redis://localhost:6379
ENVIRONMENT=production
```

## Security Features

- **API Key Authentication**: Prevents unauthorized access
- **CORS Protection**: Only allows requests from specified origins
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive request validation
- **Secure Headers**: Security headers for production

## Algorithm Details

### Similarity vs Opposite Matching

The engine supports both similarity-based and opposite-based matching:

- **+1 (Similar)**: Matches users with similar interests, personality, and lifestyle
- **-1 (Opposite)**: Inverts personality and lifestyle scores to find complementary matches

### Dealbreaker System

Users can set dealbreakers that significantly reduce compatibility scores:

- **Smoking**: No smoking preference
- **Food**: Specific dietary requirements
- **Age**: Hard age range limits

### Confidence Scoring

Each recommendation includes a confidence score based on:

- Profile completeness of both users
- Consistency of compatibility scores
- Activity level of users

## Performance Optimization

- **Database Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking I/O operations
- **Caching**: Redis caching for frequently accessed data
- **Batch Processing**: Efficient candidate filtering

## Monitoring and Logging

- **Health Check Endpoint**: `/health` for monitoring
- **Structured Logging**: Comprehensive error tracking
- **Performance Metrics**: Built-in timing and statistics

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

The API includes comprehensive error handling and validation. Test with:

```bash
curl -X POST "http://localhost:8000/api/v1/recommendations" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "recommendation_type": "friends",
    "limit": 5
  }'
```