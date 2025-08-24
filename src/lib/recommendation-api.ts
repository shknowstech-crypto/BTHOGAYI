import { createSupabaseClient } from './supabase'
import { LocalRecommendationEngine } from './local-recommendations'

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

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }
    return session.access_token
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
    const token = await this.getAuthToken()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    return response.json()
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Always use local algorithm for now (more secure)
    if (USE_LOCAL_FALLBACK || !this.isServerAvailable) {
      const recommendations = await this.localEngine.getRecommendations(request)
      return {
        user_id: request.user_id,
        recommendations,
        algorithm_version: 'local-1.0',
        generated_at: new Date().toISOString(),
        total_candidates: recommendations.length,
        fallback_used: true
      }
    }

    try {
      return await this.makeSecureRequest<RecommendationResponse>('/api/v1/recommendations', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (error) {
      console.warn('Server recommendation failed, using local algorithm:', error)
      const recommendations = await this.localEngine.getRecommendations(request)
      return {
        user_id: request.user_id,
        recommendations,
        algorithm_version: 'local-1.0',
        generated_at: new Date().toISOString(),
        total_candidates: recommendations.length,
        fallback_used: true
      }
    }
  }

  async submitFeedback(feedback: UserFeedback): Promise<{ status: string; message: string }> {
    // Store feedback locally in Supabase
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

      return { status: 'success', message: 'Feedback recorded' }
    } catch (error) {
      console.error('Failed to record feedback:', error)
      return { status: 'error', message: 'Failed to record feedback' }
    }
  }

  getServerStatus(): { available: boolean; usingFallback: boolean } {
    return {
      available: this.isServerAvailable,
      usingFallback: !this.isServerAvailable || USE_LOCAL_FALLBACK
    }
  }
}

export const recommendationAPI = new RecommendationAPIClient()

// Hook for recommendations
export function useRecommendations() {
  const getRecommendations = async (
    userId: string,
    type: 'friends' | 'dating' | 'daily_match' = 'friends',
    limit: number = 10
  ) => {
    try {
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

  return {
    getRecommendations,
    submitFeedback
  }
}