import { supabase } from './supabase'
import { DailyMatch, UserProfile } from './supabase'
import { MatchingAlgorithm } from './matching-algorithm'

export interface DailyMatchWithUser extends DailyMatch {
  matched_user: UserProfile
}

export class DailyMatchService {
  // Get today's match for a user
  static async getTodaysMatch(userId: string): Promise<DailyMatchWithUser | null> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_matches')
        .select(`
          *,
          matched_user:users!daily_matches_matched_user_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('match_date', today)
        .single()

      if (error) {
        // No match for today, generate one
        return await this.generateDailyMatch(userId)
      }

      return data
    } catch (error) {
      console.error('Error getting today\'s match:', error)
      return null
    }
  }

  // Generate a new daily match
  static async generateDailyMatch(userId: string): Promise<DailyMatchWithUser | null> {
    try {
      // Get user preferences
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!user) return null

      // Get potential matches using the matching algorithm
      const matches = await MatchingAlgorithm.getMatches({
        userId,
        connectionType: 'friend',
        similarity: user.preferences.connect_similarity || 1,
        maxResults: 20
      })

      if (matches.length === 0) return null

      // Filter out users who have been daily matches recently (last 7 days)
      const { data: recentMatches } = await supabase
        .from('daily_matches')
        .select('matched_user_id')
        .eq('user_id', userId)
        .gte('match_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      const recentMatchIds = new Set(recentMatches?.map(m => m.matched_user_id) || [])
      const availableMatches = matches.filter(m => !recentMatchIds.has(m.user.id))

      if (availableMatches.length === 0) {
        // If no new matches, use any available match
        const selectedMatch = matches[Math.floor(Math.random() * matches.length)]
        return await this.createDailyMatch(userId, selectedMatch.user, selectedMatch.compatibilityScore)
      }

      // Select a random match from top candidates (add serendipity)
      const topMatches = availableMatches.slice(0, Math.min(5, availableMatches.length))
      const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)]

      return await this.createDailyMatch(userId, selectedMatch.user, selectedMatch.compatibilityScore)
    } catch (error) {
      console.error('Error generating daily match:', error)
      return null
    }
  }

  // Create a daily match record
  private static async createDailyMatch(
    userId: string, 
    matchedUser: UserProfile, 
    compatibilityScore: number
  ): Promise<DailyMatchWithUser | null> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Delete any existing match for today
      await supabase
        .from('daily_matches')
        .delete()
        .eq('user_id', userId)
        .eq('match_date', today)

      // Create new match
      const { data, error } = await supabase
        .from('daily_matches')
        .insert({
          user_id: userId,
          matched_user_id: matchedUser.id,
          match_date: today,
          compatibility_score: compatibilityScore,
          algorithm_version: '1.0'
        })
        .select()
        .single()

      if (error) throw error

      // Create notification
      await this.createDailyMatchNotification(userId, matchedUser.display_name)

      return {
        ...data,
        matched_user: matchedUser
      }
    } catch (error) {
      console.error('Error creating daily match:', error)
      return null
    }
  }

  // Record user action on daily match
  static async recordAction(matchId: string, action: 'pass' | 'connect' | 'super_like'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_matches')
        .update({
          action,
          acted_at: new Date().toISOString(),
          viewed: true
        })
        .eq('id', matchId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error recording action:', error)
      return false
    }
  }

  // Get user's daily match streak
  static async getUserStreak(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('daily_matches')
        .select('match_date, viewed')
        .eq('user_id', userId)
        .eq('viewed', true)
        .order('match_date', { ascending: false })
        .limit(30) // Check last 30 days

      if (error) throw error
      if (!data || data.length === 0) return 0

      let streak = 0
      const today = new Date()
      
      for (let i = 0; i < data.length; i++) {
        const matchDate = new Date(data[i].match_date)
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        
        // Check if match date matches expected consecutive date
        if (matchDate.toDateString() === expectedDate.toDateString()) {
          streak++
        } else {
          break
        }
      }

      return streak
    } catch (error) {
      console.error('Error getting user streak:', error)
      return 0
    }
  }

  // Get daily match history
  static async getMatchHistory(userId: string, limit: number = 10): Promise<DailyMatchWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('daily_matches')
        .select(`
          *,
          matched_user:users!daily_matches_matched_user_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('match_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting match history:', error)
      return []
    }
  }

  // Get daily match statistics
  static async getDailyMatchStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_matches')
        .select('action, viewed')
        .eq('user_id', userId)

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        viewed: data?.filter(m => m.viewed).length || 0,
        connected: data?.filter(m => m.action === 'connect').length || 0,
        passed: data?.filter(m => m.action === 'pass').length || 0,
        superLiked: data?.filter(m => m.action === 'super_like').length || 0
      }

      return {
        ...stats,
        connectionRate: stats.viewed > 0 ? (stats.connected / stats.viewed) * 100 : 0
      }
    } catch (error) {
      console.error('Error getting daily match stats:', error)
      return {
        total: 0,
        viewed: 0,
        connected: 0,
        passed: 0,
        superLiked: 0,
        connectionRate: 0
      }
    }
  }

  // Private helper methods
  private static async createDailyMatchNotification(userId: string, matchedUserName: string) {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'daily_match',
          title: 'Your Daily Match is Here!',
          message: `Check out ${matchedUserName} - they might be perfect for you!`,
          data: {
            match_date: new Date().toISOString().split('T')[0]
          }
        })
    } catch (error) {
      console.error('Error creating daily match notification:', error)
    }
  }
}