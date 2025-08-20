import { supabase } from './supabase'
import { UserInterest } from './supabase'

export class InterestService {
  // Add interest to user
  static async addUserInterest(userId: string, interest: string, weight: number = 1.0): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: userId,
          interest: interest.toLowerCase().trim(),
          weight
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding user interest:', error)
      return false
    }
  }

  // Remove interest from user
  static async removeUserInterest(userId: string, interest: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId)
        .eq('interest', interest.toLowerCase().trim())

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing user interest:', error)
      return false
    }
  }

  // Get user interests
  static async getUserInterests(userId: string): Promise<UserInterest[]> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId)
        .order('weight', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user interests:', error)
      return []
    }
  }

  // Update interest weight
  static async updateInterestWeight(userId: string, interest: string, weight: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_interests')
        .update({ weight })
        .eq('user_id', userId)
        .eq('interest', interest.toLowerCase().trim())

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating interest weight:', error)
      return false
    }
  }

  // Get popular interests
  static async getPopularInterests(limit: number = 20): Promise<{ interest: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Count occurrences
      const interestCounts: Record<string, number> = {}
      data?.forEach(item => {
        interestCounts[item.interest] = (interestCounts[item.interest] || 0) + 1
      })

      // Sort by count and return top interests
      return Object.entries(interestCounts)
        .map(([interest, count]) => ({ interest, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting popular interests:', error)
      return []
    }
  }

  // Sync user interests with profile
  static async syncUserInterests(userId: string, interests: string[]): Promise<boolean> {
    try {
      // Remove all existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId)

      // Add new interests
      if (interests.length > 0) {
        const interestData = interests.map(interest => ({
          user_id: userId,
          interest: interest.toLowerCase().trim(),
          weight: 1.0
        }))

        const { error } = await supabase
          .from('user_interests')
          .insert(interestData)

        if (error) throw error
      }

      return true
    } catch (error) {
      console.error('Error syncing user interests:', error)
      return false
    }
  }
}