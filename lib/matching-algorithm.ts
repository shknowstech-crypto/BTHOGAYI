import { supabase } from './supabase'
import { UserProfile } from './supabase'

export interface MatchingCriteria {
  userId: string
  connectionType: 'friend' | 'date'
  similarity: 1 | -1 // +1 for similar, -1 for opposites
  maxResults?: number
}

export interface MatchResult {
  user: UserProfile
  compatibilityScore: number
  matchReasons: string[]
}

export class MatchingAlgorithm {
  // Calculate interest similarity using cosine similarity
  static calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0
    
    const set1 = new Set(interests1)
    const set2 = new Set(interests2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size // Jaccard similarity
  }

  // Calculate personality compatibility
  static calculatePersonalityMatch(
    user1: UserProfile, 
    user2: UserProfile, 
    similarity: 1 | -1
  ): number {
    const factors = {
      campus: user1.campus === user2.campus ? 1 : 0.7,
      year: Math.max(0, 1 - Math.abs(user1.year - user2.year) * 0.2),
      branch: user1.branch === user2.branch ? 1 : 0.8,
    }
    
    const baseScore = (factors.campus + factors.year + factors.branch) / 3
    
    // For opposites attract, we invert some factors
    if (similarity === -1) {
      return baseScore * 0.7 + (1 - factors.branch) * 0.3
    }
    
    return baseScore
  }

  // Main compatibility scoring function
  static calculateCompatibility(user1: UserProfile, user2: UserProfile, criteria: MatchingCriteria): number {
    const interestScore = this.calculateInterestSimilarity(user1.interests, user2.interests)
    const personalityScore = this.calculatePersonalityMatch(user1, user2, criteria.similarity)
    
    // Weight different factors based on connection type
    const weights = criteria.connectionType === 'friend' 
      ? { interests: 0.6, personality: 0.4 }
      : { interests: 0.4, personality: 0.6 }
    
    return interestScore * weights.interests + personalityScore * weights.personality
  }

  // Get potential matches for a user
  static async getMatches(criteria: MatchingCriteria): Promise<MatchResult[]> {
    try {
      // Get current user
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', criteria.userId)
        .single()

      if (!currentUser) throw new Error('User not found')

      // Get all other verified, active users
      const { data: potentialMatches } = await supabase
        .from('users')
        .select('*')
        .neq('id', criteria.userId)
        .eq('verified', true)
        .eq('is_active', true)

      if (!potentialMatches) return []

      // Get existing connections to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${criteria.userId},user2_id.eq.${criteria.userId}`)

      const excludeIds = new Set(
        existingConnections?.flatMap(conn => 
          [conn.user1_id, conn.user2_id].filter(id => id !== criteria.userId)
        ) || []
      )

      // Calculate compatibility scores
      const matches: MatchResult[] = []
      
      for (const candidate of potentialMatches) {
        if (excludeIds.has(candidate.id)) continue

        const compatibilityScore = this.calculateCompatibility(
          currentUser, 
          candidate, 
          criteria
        )

        if (compatibilityScore > 0.3) { // Minimum threshold
          const matchReasons = this.generateMatchReasons(currentUser, candidate)
          
          matches.push({
            user: candidate,
            compatibilityScore,
            matchReasons
          })
        }
      }

      // Sort by compatibility score and return top matches
      return matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, criteria.maxResults || 10)

    } catch (error) {
      console.error('Error getting matches:', error)
      return []
    }
  }

  // Generate reasons why two users matched
  static generateMatchReasons(user1: UserProfile, user2: UserProfile): string[] {
    const reasons: string[] = []
    
    // Same campus
    if (user1.campus === user2.campus) {
      reasons.push(`Both at BITS ${user1.campus}`)
    }
    
    // Similar year
    if (Math.abs(user1.year - user2.year) <= 1) {
      reasons.push('Similar academic year')
    }
    
    // Same branch
    if (user1.branch === user2.branch) {
      reasons.push(`Both studying ${user1.branch}`)
    }
    
    // Common interests
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    )
    
    if (commonInterests.length > 0) {
      reasons.push(`Share interests in ${commonInterests.slice(0, 2).join(', ')}`)
    }
    
    return reasons.slice(0, 3) // Max 3 reasons
  }

  // Generate daily match for a user
  static async generateDailyMatch(userId: string): Promise<MatchResult | null> {
    try {
      // Check if user already has a daily match for today
      const { data: existingMatch } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', userId)
        .eq('match_date', new Date().toISOString().split('T')[0])
        .single()

      if (existingMatch) return null // Already has daily match

      // Get user preferences
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!user) return null

      // Get potential matches
      const matches = await this.getMatches({
        userId,
        connectionType: 'friend', // Daily matches start as friends
        similarity: user.preferences.connect_similarity || 1,
        maxResults: 50
      })

      if (matches.length === 0) return null

      // Select a random match from top candidates (to add serendipity)
      const topMatches = matches.slice(0, Math.min(5, matches.length))
      const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)]

      // Save daily match
      await supabase
        .from('daily_matches')
        .insert({
          user_id: userId,
          matched_user_id: selectedMatch.user.id,
          compatibility_score: selectedMatch.compatibilityScore,
          algorithm_version: '1.0'
        })

      return selectedMatch

    } catch (error) {
      console.error('Error generating daily match:', error)
      return null
    }
  }
}