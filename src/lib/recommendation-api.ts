import { UserProfile } from './supabase'

// API Configuration
const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8000'
const API_KEY = import.meta.env.VITE_RECOMMENDATION_API_KEY

interface RecommendationRequest {
  user_id: string
  recommendation_type: 'friends' | 'dating' | 'daily_match' | 'similar' | 'opposite'
  limit?: number
  filters?: {
    exclude_user_ids?: string[]
    min_compatibility_score?: number
    campus_filter?: string[]
    verified_only?: boolean
    active_recently?: boolean
  }
}

interface RecommendationItem {
  user_id: string
  compatibility_score: number
  match_reasons: string[]
  common_interests: string[]
  personality_match: Record<string, number>
  distance_km?: number
  explanation: string
  confidence: number
}

interface RecommendationResponse {
  user_id: string
  recommendations: RecommendationItem[]
  algorithm_version: string
  generated_at: string
  total_candidates: number
  fallback_used: boolean
}

class RecommendationAPI {
  private baseUrl: string
  private apiKey: string
  private isServerAvailable: boolean = true

  constructor() {
    this.baseUrl = RECOMMENDATION_API_URL
    this.apiKey = API_KEY || ''
    
    // Check server availability on initialization
    this.checkServerHealth()
  }

  private async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      } as any)
      
      this.isServerAvailable = response.ok
      return response.ok
    } catch (error) {
      console.warn('Recommendation server unavailable, falling back to local algorithm')
      this.isServerAvailable = false
      return false
    }
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Recommendation API key not configured')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    return response.json()
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      // First check if server is available
      const serverHealthy = await this.checkServerHealth()
      
      if (!serverHealthy || !this.isServerAvailable) {
        // Fall back to local algorithm
        return this.getLocalRecommendations(request)
      }

      // Try server-side recommendations
      const response = await this.makeRequest<RecommendationResponse>(
        '/api/v1/recommendations',
        request
      )

      response.fallback_used = false
      return response

    } catch (error) {
      console.warn('Server recommendation failed, using local algorithm:', error)
      this.isServerAvailable = false
      
      // Fall back to local algorithm
      return this.getLocalRecommendations(request)
    }
  }

  private async getLocalRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Import local recommendation logic
    const { LocalRecommendationEngine } = await import('./local-recommendations')
    const localEngine = new LocalRecommendationEngine()
    
    const recommendations = await localEngine.getRecommendations(request)
    
    return {
      user_id: request.user_id,
      recommendations,
      algorithm_version: 'local-1.0',
      generated_at: new Date().toISOString(),
      total_candidates: recommendations.length,
      fallback_used: true
    }
  }

  async submitFeedback(
    userId: string, 
    targetUserId: string, 
    action: 'like' | 'pass' | 'super_like' | 'block'
  ): Promise<void> {
    try {
      if (!this.isServerAvailable) return // Skip if server unavailable
      
      await this.makeRequest('/api/v1/feedback', {
        user_id: userId,
        target_user_id: targetUserId,
        action
      })
    } catch (error) {
      console.warn('Failed to submit feedback:', error)
      // Don't throw error - feedback is not critical
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      if (!this.isServerAvailable) return {}
      
      const response = await fetch(`${this.baseUrl}/api/v1/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) return {}
      return response.json()
    } catch (error) {
      console.warn('Failed to get user stats:', error)
      return {}
    }
  }

  getServerStatus(): { available: boolean; usingFallback: boolean } {
    return {
      available: this.isServerAvailable,
      usingFallback: !this.isServerAvailable
    }
  }
}

export const recommendationAPI = new RecommendationAPI()
export type { RecommendationRequest, RecommendationResponse, RecommendationItem }