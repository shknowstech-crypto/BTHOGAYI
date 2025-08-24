import { supabase } from './supabase'

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

class RecommendationEngineAPI {
  private baseUrl: string
  private supabase = supabase

  constructor() {
    // Use Vite environment variable
    this.baseUrl = import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8000'
  }

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }
    return session.access_token
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
    return this.makeRequest<RecommendationResponse>('/api/v1/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async submitFeedback(feedback: UserFeedback): Promise<{ status: string; message: string }> {
    return this.makeRequest<{ status: string; message: string }>('/api/v1/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    })
  }

  async getUserStats(userId: string): Promise<any> {
    return this.makeRequest<any>(`/api/v1/stats/${userId}`)
  }

  // Health check endpoint (doesn't require auth)
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
    return response.json()
  }
}

export const recommendationAPI = new RecommendationEngineAPI()

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
