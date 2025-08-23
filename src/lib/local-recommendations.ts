import { supabase, UserProfile } from './supabase'
import type { RecommendationRequest, RecommendationItem } from './recommendation-api'

interface LocalUserProfile extends UserProfile {
  interests_weighted?: [string, number][]
  personality_traits?: Record<string, number>
  food_preference?: string
  smoking?: string
  drinking?: string
}

export class LocalRecommendationEngine {
  private interestCategories = {
    technology: ['coding', 'programming', 'ai', 'tech', 'software', 'hardware'],
    sports: ['football', 'cricket', 'basketball', 'tennis', 'gym', 'fitness'],
    arts: ['music', 'painting', 'photography', 'dance', 'theater', 'design'],
    academics: ['research', 'science', 'mathematics', 'physics', 'chemistry'],
    social: ['parties', 'networking', 'events', 'socializing', 'friends'],
    travel: ['travel', 'adventure', 'exploration', 'hiking', 'trekking'],
    food: ['cooking', 'food', 'restaurants', 'cuisine', 'baking'],
    entertainment: ['movies', 'tv', 'gaming', 'books', 'reading', 'anime']
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationItem[]> {
    try {
      // Get user profile
      const { data: user } = await supabase
        .from('users')
        .select(`
          *,
          user_interests (interest, weight)
        `)
        .eq('id', request.user_id)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      // Get potential matches
      const candidates = await this.getPotentialMatches(user, request)
      
      // Calculate compatibility scores
      const recommendations: RecommendationItem[] = []
      
      for (const candidate of candidates) {
        const compatibility = this.calculateCompatibility(user, candidate, request.recommendation_type)
        
        if (compatibility.score > 0.3) {
          recommendations.push({
            user_id: candidate.id,
            compatibility_score: compatibility.score,
            match_reasons: compatibility.reasons,
            common_interests: compatibility.commonInterests,
            personality_match: compatibility.personalityMatch,
            explanation: compatibility.explanation,
            confidence: compatibility.confidence
          })
        }
      }

      // Sort by compatibility score
      recommendations.sort((a, b) => b.compatibility_score - a.compatibility_score)
      
      return recommendations.slice(0, request.limit || 10)
      
    } catch (error) {
      console.error('Local recommendation error:', error)
      return []
    }
  }

  private async getPotentialMatches(
    user: LocalUserProfile, 
    request: RecommendationRequest
  ): Promise<LocalUserProfile[]> {
    const excludeIds = [user.id, ...(request.filters?.exclude_user_ids || [])]
    
    let query = supabase
      .from('users')
      .select(`
        *,
        user_interests (interest, weight)
      `)
      .eq('campus', user.campus)
      .eq('is_active', true)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .gte('last_seen', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Active in last 30 days

    if (request.filters?.verified_only) {
      query = query.eq('verified', true)
    }

    const { data: candidates } = await query.limit(100)
    
    return candidates || []
  }

  private calculateCompatibility(
    user: LocalUserProfile,
    candidate: LocalUserProfile,
    recommendationType: string
  ) {
    const scores: Record<string, number> = {}
    const reasons: string[] = []
    const commonInterests: string[] = []

    // 1. Interest Similarity
    const interestResult = this.calculateInterestSimilarity(user, candidate)
    scores.interests = interestResult.score
    commonInterests.push(...interestResult.common)
    
    if (interestResult.score > 0.7) {
      reasons.push(`Share ${interestResult.common.length} common interests`)
    }

    // 2. Academic Compatibility
    scores.academic = this.calculateAcademicCompatibility(user, candidate)
    
    if (user.campus === candidate.campus) {
      reasons.push('Same campus')
    }

    // 3. Age Compatibility
    if (user.age && candidate.age) {
      const ageDiff = Math.abs(user.age - candidate.age)
      scores.age = Math.max(0, 1 - (ageDiff / 10))
      
      if (ageDiff <= 2) {
        reasons.push('Similar age')
      }
    } else {
      scores.age = 0.5
    }

    // 4. Activity Compatibility
    scores.activity = this.calculateActivityCompatibility(user, candidate)

    // 5. Apply similarity preference
    const similarityPref = this.getSimilarityPreference(user, recommendationType)
    if (similarityPref === -1) {
      // User wants opposites - invert some scores
      scores.interests = 1 - scores.interests
      reasons.push('Complementary interests')
    }

    // Calculate weighted final score
    const weights = this.getWeights(recommendationType)
    const finalScore = Object.keys(scores).reduce((sum, key) => {
      return sum + (scores[key] * (weights[key] || 0.2))
    }, 0)

    // Generate explanation
    const explanation = reasons.length > 0 ? reasons.join(' • ') : 'Potential good match'

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(user, candidate, scores)

    return {
      score: Math.max(0, Math.min(1, finalScore)),
      reasons,
      commonInterests,
      personalityMatch: {},
      explanation,
      confidence
    }
  }

  private calculateInterestSimilarity(user: LocalUserProfile, candidate: LocalUserProfile) {
    const userInterests = new Set(user.interests || [])
    const candidateInterests = new Set(candidate.interests || [])
    
    if (userInterests.size === 0 || candidateInterests.size === 0) {
      return { score: 0, common: [] }
    }

    const common = Array.from(userInterests).filter(interest => 
      candidateInterests.has(interest)
    )
    
    const union = new Set([...userInterests, ...candidateInterests])
    const jaccardScore = common.length / union.size

    return {
      score: jaccardScore,
      common
    }
  }

  private calculateAcademicCompatibility(user: LocalUserProfile, candidate: LocalUserProfile): number {
    let score = 0

    // Same campus bonus
    if (user.campus === candidate.campus) {
      score += 0.4
    }

    // Year compatibility
    const yearDiff = Math.abs((user.year || 1) - (candidate.year || 1))
    score += Math.max(0, 1 - (yearDiff * 0.2)) * 0.3

    // Branch compatibility
    if (user.branch === candidate.branch) {
      score += 0.2
    } else {
      score += 0.1 // Diversity bonus
    }

    return Math.min(1, score)
  }

  private calculateActivityCompatibility(user: LocalUserProfile, candidate: LocalUserProfile): number {
    const userLastSeen = new Date(user.last_seen)
    const candidateLastSeen = new Date(candidate.last_seen)
    const now = new Date()

    const userDaysAgo = Math.floor((now.getTime() - userLastSeen.getTime()) / (1000 * 60 * 60 * 24))
    const candidateDaysAgo = Math.floor((now.getTime() - candidateLastSeen.getTime()) / (1000 * 60 * 60 * 24))

    if (userDaysAgo <= 1 && candidateDaysAgo <= 1) return 1.0
    if (userDaysAgo <= 7 && candidateDaysAgo <= 7) return 0.8
    if (userDaysAgo <= 30 && candidateDaysAgo <= 30) return 0.6
    return 0.3
  }

  private getSimilarityPreference(user: LocalUserProfile, recommendationType: string): number {
    const preferences = user.preferences || {}
    
    if (recommendationType === 'dating') {
      return preferences.dating_similarity || 1
    } else {
      return preferences.connect_similarity || 1
    }
  }

  private getWeights(recommendationType: string): Record<string, number> {
    const weights = {
      friends: {
        interests: 0.4,
        academic: 0.3,
        age: 0.2,
        activity: 0.1
      },
      dating: {
        interests: 0.3,
        academic: 0.2,
        age: 0.3,
        activity: 0.2
      },
      daily_match: {
        interests: 0.35,
        academic: 0.25,
        age: 0.25,
        activity: 0.15
      }
    }

    return weights[recommendationType as keyof typeof weights] || weights.friends
  }

  private calculateConfidence(
    user: LocalUserProfile, 
    candidate: LocalUserProfile, 
    scores: Record<string, number>
  ): number {
    let confidence = 0

    // Profile completeness
    const userCompleteness = this.calculateProfileCompleteness(user)
    const candidateCompleteness = this.calculateProfileCompleteness(candidate)
    confidence += (userCompleteness + candidateCompleteness) / 2 * 0.5

    // Score consistency
    const scoreValues = Object.values(scores)
    const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    const variance = scoreValues.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scoreValues.length
    confidence += Math.max(0, 1 - variance) * 0.3

    // Activity level
    confidence += scores.activity * 0.2

    return Math.min(1, confidence)
  }

  private calculateProfileCompleteness(user: LocalUserProfile): number {
    let completeness = 0
    const fields = ['display_name', 'bio', 'age', 'interests']
    
    for (const field of fields) {
      if (user[field as keyof LocalUserProfile]) {
        if (field === 'interests' && Array.isArray(user.interests) && user.interests.length >= 3) {
          completeness += 0.25
        } else if (field === 'bio' && user.bio && user.bio.length >= 50) {
          completeness += 0.25
        } else if (field !== 'interests' && field !== 'bio') {
          completeness += 0.25
        }
      }
    }

    return completeness
  }
}