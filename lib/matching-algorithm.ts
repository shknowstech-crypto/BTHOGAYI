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
  // Enhanced interest similarity using Jaccard similarity
  // Calculate interest similarity using cosine similarity
  static calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0
    
    const set1 = new Set(interests1)
    const set2 = new Set(interests2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    
    const union = new Set([...set1, ...set2])
    const jaccardSimilarity = intersection.size / union.size
    
    // Weight by number of common interests
    const commonInterestBonus = Math.min(intersection.size / 5, 0.3) // Max 30% bonus
    return Math.min(jaccardSimilarity + commonInterestBonus, 1.0)
  }

  // Enhanced personality compatibility with campus and academic factors
  static calculatePersonalityMatch(
    user1: UserProfile, 
    user2: UserProfile, 
    similarity: 1 | -1
  ): number {
    // Base compatibility factors
    const factors = {
      campus: user1.campus === user2.campus ? 1.0 : 0.6, // Same campus bonus
      year: Math.max(0, 1 - Math.abs(user1.year - user2.year) * 0.15), // Year proximity
      branch: user1.branch === user2.branch ? 0.9 : 0.7, // Same branch slight bonus
      age: user1.age && user2.age ? Math.max(0, 1 - Math.abs(user1.age - user2.age) * 0.08) : 0.6
    }
    
    // Calculate weighted base score
    const weights = { campus: 0.3, year: 0.25, branch: 0.2, age: 0.25 }
    const baseScore = 
      factors.campus * weights.campus +
      factors.year * weights.year +
      factors.branch * weights.branch +
      factors.age * weights.age
    
    // Apply similarity preference
    if (similarity === -1) {
      // For opposites attract, reduce same-branch bonus and add diversity bonus
      const diversityBonus = user1.branch !== user2.branch ? 0.2 : 0
      return Math.min(baseScore * 0.8 + diversityBonus, 1.0)
    }
    
    return baseScore
  }

  // Enhanced gender compatibility check
  // Calculate gender compatibility
  static calculateGenderMatch(user1: UserProfile, user2: UserProfile): boolean {
    const user1Pref = user1.preferences.gender_preference || 'any'
    const user2Pref = user2.preferences.gender_preference || 'any'
    
    // If either user has 'any' preference, it's a match
    if (user1Pref === 'any' || user2Pref === 'any') return true
    
    // Both users must have compatible preferences
    const user1Gender = user1.gender || 'other'
    const user2Gender = user2.gender || 'other'
    
    return (user1Pref === user2Gender || user1Pref === 'any') && 
           (user2Pref === user1Gender || user2Pref === 'any')
  }

  // Enhanced compatibility scoring with multiple factors
  static calculateCompatibility(user1: UserProfile, user2: UserProfile, criteria: MatchingCriteria): number {
    const interestScore = this.calculateInterestSimilarity(user1.interests, user2.interests)
    const personalityScore = this.calculatePersonalityMatch(user1, user2, criteria.similarity)
    
    // Activity and engagement factors
    const activityScore = user1.is_active && user2.is_active ? 1.0 : 0.5
    const verificationScore = (user1.verified ? 0.5 : 0) + (user2.verified ? 0.5 : 0)
    const streakBonus = Math.min((user1.streak_count + user2.streak_count) / 20, 0.2)
    
    // Dynamic weights based on connection type
    const weights = criteria.connectionType === 'friend' 
      ? { interests: 0.45, personality: 0.35, activity: 0.1, verification: 0.1 }
      : { interests: 0.3, personality: 0.5, activity: 0.1, verification: 0.1 }
    
    const baseScore = 
      interestScore * weights.interests + 
      personalityScore * weights.personality +
      activityScore * weights.activity +
      verificationScore * weights.verification
    
    // Add streak bonus and ensure score is between 0 and 1
    return Math.min(baseScore + streakBonus, 1.0)
  }

  // Enhanced match finding with better filtering
  static async getMatches(criteria: MatchingCriteria): Promise<MatchResult[]> {
    try {
      // Get current user
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', criteria.userId)
        .single()

      if (!currentUser) throw new Error('User not found')

      // Build query for potential matches
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', criteria.userId)
        .eq('is_active', true)
        .eq('verified', true) // Only verified users
      
      // Apply gender filtering for dating connections
      if (criteria.connectionType === 'date') {
        const genderPref = currentUser.preferences.gender_preference
        if (genderPref && genderPref !== 'any') {
          query = query.eq('gender', genderPref)
        }
      }
      
      const { data: potentialMatches } = await query

      if (!potentialMatches) return []

      // Get existing connections and blocked users to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('user1_id, user2_id, status')
        .or(`user1_id.eq.${criteria.userId},user2_id.eq.${criteria.userId}`)

      const excludeIds = new Set(
        existingConnections?.flatMap(conn => 
          [conn.user1_id, conn.user2_id].filter(id => id !== criteria.userId)
        ) || []
      )

      // Also exclude users from recent daily matches (last 7 days)
      const { data: recentDailyMatches } = await supabase
        .from('daily_matches')
        .select('matched_user_id')
        .eq('user_id', criteria.userId)
        .gte('match_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      recentDailyMatches?.forEach(match => excludeIds.add(match.matched_user_id))

      // Calculate compatibility scores
      const matches: MatchResult[] = []
      
      for (const candidate of potentialMatches) {
        if (excludeIds.has(candidate.id)) continue
        
        // Additional gender compatibility check for dating
        if (criteria.connectionType === 'date' && !this.calculateGenderMatch(currentUser, candidate)) {
          continue
        }

        const compatibilityScore = this.calculateCompatibility(
          currentUser, 
          candidate, 
          criteria
        )

        // Dynamic threshold based on connection type
        const minThreshold = criteria.connectionType === 'date' ? 0.4 : 0.3
        
        if (compatibilityScore > minThreshold) {
          const matchReasons = this.generateMatchReasons(currentUser, candidate)
          
          matches.push({
            user: candidate,
            compatibilityScore,
            matchReasons
          })
        }
      }

      // Sort by compatibility score with some randomization for diversity
      return matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .map((match, index) => ({
          ...match,
          // Add slight randomization to prevent always showing same order
          compatibilityScore: match.compatibilityScore + (Math.random() - 0.5) * 0.05
        }))
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, criteria.maxResults || 10)

    } catch (error) {
      console.error('Error getting matches:', error)
      return []
    }
  }

  // Enhanced match reasons generation
  static generateMatchReasons(user1: UserProfile, user2: UserProfile): string[] {
    const reasons: string[] = []
    
    // Same campus
    if (user1.campus === user2.campus) {
      reasons.push(`Both at BITS ${user1.campus}`)
    }
    
    // Academic year proximity
    const yearDiff = Math.abs(user1.year - user2.year)
    if (yearDiff === 0) {
      reasons.push('Same academic year')
    } else if (yearDiff === 1) {
      reasons.push('Adjacent academic years')
    }
    
    // Same branch
    if (user1.branch === user2.branch) {
      reasons.push(`Both studying ${user1.branch}`)
    } else {
      reasons.push('Complementary academic backgrounds')
    }
    
    // Common interests
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.map(i => i.toLowerCase()).includes(interest.toLowerCase())
    )
    
    if (commonInterests.length >= 3) {
      reasons.push(`Share ${commonInterests.length} common interests`)
    } else if (commonInterests.length > 0) {
      reasons.push(`Both interested in ${commonInterests.slice(0, 2).join(' & ')}`)
    }
    
    // High activity users
    if (user1.streak_count > 5 && user2.streak_count > 5) {
      reasons.push('Both highly active users')
    }
    
    // Verification status
    if (user1.verified && user2.verified) {
      reasons.push('Both fully verified profiles')
    }
    
    return reasons.slice(0, 4) // Max 4 reasons for better context
  }

  // Enhanced daily match generation with better algorithm
  static async generateDailyMatch(userId: string): Promise<MatchResult | null> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if user already has today's match
      const { data: existingMatch } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', userId)
        .eq('match_date', today)
        .single()

      if (existingMatch && !existingMatch.action) {
        // Return existing match if not acted upon
        const { data: matchedUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', existingMatch.matched_user_id)
          .single()
          
        if (matchedUser) {
          return {
            user: matchedUser,
            compatibilityScore: existingMatch.compatibility_score,
            matchReasons: ['Your special daily match', 'AI-selected for you']
          }
        }
      }

      // Get user preferences
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!user) return null

      // Get potential matches with higher quality threshold for daily matches
      const matches = await this.getMatches({
        userId,
        connectionType: 'friend',
        similarity: user.preferences.connect_similarity || 1,
        maxResults: 20 // Smaller pool for higher quality
      })

      if (matches.length === 0) return null

      // Weighted selection favoring higher compatibility but with some randomness
      const weights = matches.map((_, index) => Math.pow(0.8, index)) // Exponential decay
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      const random = Math.random() * totalWeight
      
      let cumulativeWeight = 0
      let selectedIndex = 0
      
      for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i]
        if (random <= cumulativeWeight) {
          selectedIndex = i
          break
        }
      }
      
      const selectedMatch = matches[selectedIndex]

      // Delete any existing match for today and create new one
      await supabase
        .from('daily_matches')
        .delete()
        .eq('user_id', userId)
        .eq('match_date', today)
        
      await supabase
        .from('daily_matches')
        .insert({
          user_id: userId,
          matched_user_id: selectedMatch.user.id,
          match_date: today,
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