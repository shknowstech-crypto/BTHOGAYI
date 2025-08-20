'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MatchCard } from '@/components/ui/match-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ReportModal } from '@/components/ui/report-modal'
import { Users, Settings, Filter, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { MatchingAlgorithm, MatchResult } from '@/lib/matching-algorithm'
import { ConnectionService } from '@/lib/connections'
import { useRouter } from 'next/navigation'

export default function ConnectPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [similarity, setSimilarity] = useState<1 | -1>(1)
  const [connecting, setConnecting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadMatches()
    }
  }, [user, similarity])

  const loadMatches = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const newMatches = await MatchingAlgorithm.getMatches({
        userId: user.id,
        connectionType: 'friend',
        similarity,
        maxResults: 10
      })
      setMatches(newMatches)
      setCurrentMatchIndex(0)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!user || !currentMatch) return
    
    setConnecting(true)
    try {
      await ConnectionService.createConnection(
        user.id,
        currentMatch.user.id,
        'friend',
        currentMatch.compatibilityScore
      )
      
      // Move to next match
      nextMatch()
    } catch (error) {
      console.error('Error creating connection:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handlePass = () => {
    nextMatch()
  }

  const nextMatch = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1)
    } else {
      // Load more matches
      loadMatches()
    }
  }

  const currentMatch = matches[currentMatchIndex]

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              CONNECT
            </h1>
            <p className="text-white/70">
              Find friends with similar interests and personalities
            </p>
          </div>
          
          <div className="flex gap-4">
            <GradientButton
              variant="secondary"
              onClick={loadMatches}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </GradientButton>
            <GradientButton variant="secondary">
              <Settings className="w-5 h-5" />
              Settings
            </GradientButton>
          </div>
        </motion.div>

        {/* Similarity Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-2">Matching Preference</h3>
                <p className="text-white/70 text-sm">
                  Choose how you want to be matched with others
                </p>
              </div>
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setSimilarity(1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    similarity === 1
                      ? 'bg-blue-500 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Similar (+1)
                </button>
                <button
                  onClick={() => setSimilarity(-1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    similarity === -1
                      ? 'bg-purple-500 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Opposite (-1)
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Match Cards */}
        <div className="flex justify-center">
          {loading ? (
            <GlassCard className="p-12 text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-white/70">Finding your perfect matches...</p>
            </GlassCard>
          ) : matches.length === 0 ? (
            <GlassCard className="p-12 text-center max-w-md">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No More Matches</h3>
              <p className="text-white/70 mb-6">
                We've shown you all available matches. Check back later for new people!
              </p>
              <GradientButton onClick={loadMatches}>
                <RefreshCw className="w-5 h-5" />
                Try Again
              </GradientButton>
            </GlassCard>
          ) : (
            <AnimatePresence mode="wait">
              {currentMatch && (
                <MatchCard
                  key={currentMatch.user.id}
                  user={currentMatch.user}
                  compatibilityScore={currentMatch.compatibilityScore}
                  matchReasons={currentMatch.matchReasons}
                  onLike={handleConnect}
                  onPass={handlePass}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Match Counter */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <p className="text-white/70">
              {currentMatchIndex + 1} of {matches.length} matches
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Report Modal */}
      {currentMatch && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={currentMatch.user.id}
          reportedUserName={currentMatch.user.display_name}
          reporterId={user?.id || ''}
        />
      )}
    </div>
  )
}