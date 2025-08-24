import { createSupabaseClient } from './supabase'
import { LocalRecommendationEngine } from './local-recommendations'
import { AuthService } from './auth'

// Secure API Configuration
const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL
const USE_LOCAL_FALLBACK = !RECOMMENDATION_API_URL

export interface RecommendationRequest {
  user_id: string
  recommendation_type: 'friends' | 'dating' | 'daily_match'
  limit?: number
  filters?: {
    exclude_user_ids?: string[]
    min_compatibility_score?: number
    campus_filter?: string[]
    verified_only?: boolean
    active_recently?: boolean
  }
}

export interface RecommendationItem {
  user_id: string
  compatibility_score: number
  match_reasons: string[]
  common_interests: string[]
  personality_match: Record<string, number>
  distance_km?: number
  explanation: string
  confidence: number
}

export interface RecommendationResponse {
  user_id: string
  recommendations: RecommendationItem[]
  algorithm_version: string
  generated_at: string
  total_candidates: number
  fallback_used: boolean
}

export interface UserFeedback {
  user_id: string
  target_user_id: string
  action: 'like' | 'pass' | 'super_like' | 'block' | 'report'
  context?: Record<string, any>
}

class RecommendationAPIClient {
  private baseURL: string
  private supabase = createSupabaseClient()
  private localEngine = new LocalRecommendationEngine()
  private isServerAvailable: boolean = false

  constructor() {
    this.baseURL = RECOMMENDATION_API_URL || ''
    this.checkServerHealth()
  }

  private async getJWTToken(): Promise<string> {
    const token = await AuthService.getJWTToken()
    if (!token) {
      throw new Error('No authentication token available. Please sign in again.')
    }
    return token
  }

  private async checkServerHealth(): Promise<boolean> {
    if (!this.baseURL) {
      this.isServerAvailable = false
      return false
    }

    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      this.isServerAvailable = response.ok
      return response.ok
    } catch (error) {
      console.warn('Recommendation server unavailable, using local algorithm')
      this.isServerAvailable = false
      return false
    }
  }

  private async makeSecureRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getJWTToken()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-Type': 'bitspark-frontend',
        'X-API-Version': '2.0',
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - redirect to auth
        throw new Error('Authentication expired. Please sign in again.')
      }
      
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    return response.json()
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Always use local algorithm for now (more secure and reliable)
    if (USE_LOCAL_FALLBACK || !this.isServerAvailable) {
      const recommendations = await this.localEngine.getRecommendations(request)
      return {
        user_id: request.user_id,
        recommendations,
        algorithm_version: 'local-2.0',
        generated_at: new Date().toISOString(),
        total_candidates: recommendations.length,
        fallback_used: true
      }
    }

    try {
      // Ensure user is authenticated before making API call
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser || currentUser.id !== request.user_id) {
        throw new Error('Authentication mismatch. Please sign in again.')
      }

      // Update user activity before getting recommendations
      await AuthService.updateUserActivity(request.user_id)

      const response = await this.makeSecureRequest<RecommendationResponse>('/api/v1/recommendations', {
        method: 'POST',
        body: JSON.stringify(request),
      })

      return response
    } catch (error) {
      console.warn('Server recommendation failed, using local algorithm:', error)
      
      // Fallback to local algorithm
      const recommendations = await this.localEngine.getRecommendations(request)
      return {
        user_id: request.user_id,
        recommendations,
        algorithm_version: 'local-2.0-fallback',
        generated_at: new Date().toISOString(),
        total_candidates: recommendations.length,
        fallback_used: true
      }
    }
  }

  async submitFeedback(feedback: UserFeedback): Promise<{ status: string; message: string }> {
    // Store feedback locally in Supabase first
    try {
      await this.supabase
        .from('user_feedback')
        .insert({
          user_id: feedback.user_id,
          target_user_id: feedback.target_user_id,
          action: feedback.action,
          context: feedback.context || {},
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to record feedback locally:', error)
    }

    // Try to send to recommendation engine if available
    if (this.isServerAvailable && this.baseURL) {
      try {
        return await this.makeSecureRequest<{ status: string; message: string }>('/api/v1/feedback', {
          method: 'POST',
          body: JSON.stringify(feedback),
        })
      } catch (error) {
        console.warn('Failed to send feedback to server:', error)
      }
    }

    return { status: 'success', message: 'Feedback recorded locally' }
  }

  async getUserStats(userId: string): Promise<any> {
    if (this.isServerAvailable && this.baseURL) {
      try {
        return await this.makeSecureRequest<any>(`/api/v1/stats/${userId}`)
      } catch (error) {
        console.warn('Failed to get stats from server:', error)
      }
    }

    // Fallback to local stats
    return this.getLocalUserStats(userId)
  }

  private async getLocalUserStats(userId: string): Promise<any> {
    try {
      const { data: feedback } = await this.supabase
        .from('user_feedback')
        .select('action')
        .eq('user_id', userId)

      const { data: connections } = await this.supabase
        .from('connections')
        .select('compatibility_score')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'accepted')

      const likes = feedback?.filter(f => f.action === 'like').length || 0
      const passes = feedback?.filter(f => f.action === 'pass').length || 0
      const totalConnections = connections?.length || 0
      const avgCompatibility = connections?.reduce((sum, c) => sum + (c.compatibility_score || 0), 0) / Math.max(totalConnections, 1) || 0

      return {
        likes_given: likes,
        passes_given: passes,
        total_connections: totalConnections,
        avg_compatibility: avgCompatibility,
        match_rate: likes > 0 ? (totalConnections / likes) : 0
      }
    } catch (error) {
      console.error('Failed to get local stats:', error)
      return {}
    }
  }

  getServerStatus(): { available: boolean; usingFallback: boolean } {
    return {
      available: this.isServerAvailable,
      usingFallback: !this.isServerAvailable || USE_LOCAL_FALLBACK
    }
  }

  // Health check endpoint (doesn't require auth)
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    if (!this.baseURL) {
      return { status: 'local', service: 'Local Algorithm', version: '2.0' }
    }

    try {
      const response = await fetch(`${this.baseURL}/health`, {
        signal: AbortSignal.timeout(3000)
      })
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const data = await response.json()
      this.isServerAvailable = true
      return data
    } catch (error) {
      this.isServerAvailable = false
      return { status: 'offline', service: 'Recommendation Engine', version: 'unknown' }
    }
  }
}

export const recommendationAPI = new RecommendationAPIClient()

// Hook for recommendations with JWT authentication
export function useRecommendations() {
  const getRecommendations = async (
    userId: string,
    type: 'friends' | 'dating' | 'daily_match' = 'friends',
    limit: number = 10
  ) => {
    try {
      // Verify user is authenticated
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser || currentUser.id !== userId) {
        throw new Error('Authentication required. Please sign in.')
      }

      const response = await recommendationAPI.getRecommendations({
        user_id: userId,
        recommendation_type: type,
        limit,
        filters: {
          verified_only: true,
          active_recently: true
        }
      })
      return response.recommendations
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      throw error
    }
  }

  const submitFeedback = async (
    userId: string,
    targetUserId: string,
    action: UserFeedback['action'],
    context?: Record<string, any>
  ) => {
    try {
      // Verify user is authenticated
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser || currentUser.id !== userId) {
        throw new Error('Authentication required. Please sign in.')
      }

      await recommendationAPI.submitFeedback({
        user_id: userId,
        target_user_id: targetUserId,
        action,
        context
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
  }

  const getUserStats = async (userId: string) => {
    try {
      return await recommendationAPI.getUserStats(userId)
    } catch (error) {
      console.error('Failed to get user stats:', error)
      throw error
    }
  }

  return {
    getRecommendations,
    submitFeedback,
    getUserStats
  }
}