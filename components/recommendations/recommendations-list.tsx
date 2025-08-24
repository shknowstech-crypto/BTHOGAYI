import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRecommendations, RecommendationItem } from '@/lib/recommendation-api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function RecommendationsList() {
  const { user } = useAuthStore()
  const { getRecommendations, submitFeedback } = useRecommendations()
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)
    
    try {
      const recs = await getRecommendations(user.id, 'friends', 10)
      setRecommendations(recs)
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations')
      toast.error('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (targetUserId: string, action: 'like' | 'pass') => {
    if (!user?.id) return

    try {
      await submitFeedback(user.id, targetUserId, action)
      
      // Remove the recommendation from the list
      setRecommendations(prev => 
        prev.filter(rec => rec.user_id !== targetUserId)
      )
      
      toast.success(action === 'like' ? 'Liked!' : 'Passed')
    } catch (err: any) {
      toast.error('Failed to submit feedback')
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-white/70">Loading recommendations...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={loadRecommendations} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70 mb-4">No recommendations available</p>
        <Button onClick={loadRecommendations} variant="outline">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Recommended for You
        </h2>
        <Button onClick={loadRecommendations} variant="ghost" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.user_id}
            recommendation={rec}
            onLike={() => handleFeedback(rec.user_id, 'like')}
            onPass={() => handleFeedback(rec.user_id, 'pass')}
          />
        ))}
      </div>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: RecommendationItem
  onLike: () => void
  onPass: () => void
}

function RecommendationCard({ recommendation, onLike, onPass }: RecommendationCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-white">User {recommendation.user_id.slice(0, 8)}</h3>
          <p className="text-sm text-white/70">
            {Math.round(recommendation.compatibility_score * 100)}% match
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">
            Confidence: {Math.round(recommendation.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* Common Interests */}
      {recommendation.common_interests.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-white/60 mb-1">Common Interests:</p>
          <div className="flex flex-wrap gap-1">
            {recommendation.common_interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
            {recommendation.common_interests.length > 3 && (
              <span className="text-xs text-white/50">
                +{recommendation.common_interests.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Match Reasons */}
      {recommendation.match_reasons.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-white/60 mb-1">Why this match:</p>
          <p className="text-sm text-white/80">
            {recommendation.match_reasons.slice(0, 2).join(' • ')}
          </p>
        </div>
      )}

      {/* Explanation */}
      {recommendation.explanation && (
        <div className="mb-4">
          <p className="text-sm text-white/70 italic">
            "{recommendation.explanation}"
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onPass}
          variant="outline"
          size="sm"
          className="flex-1 border-white/30 text-white/70 hover:bg-white/10"
        >
          Pass
        </Button>
        <Button
          onClick={onLike}
          size="sm"
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          Like
        </Button>
      </div>
    </div>
  )
}
