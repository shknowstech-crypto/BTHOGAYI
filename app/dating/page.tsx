'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MatchCard } from '@/components/ui/match-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Heart, Settings, Calendar, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { MatchingAlgorithm, MatchResult } from '@/lib/matching-algorithm'
import { ConnectionService } from '@/lib/connections'
import { useRouter } from 'next/navigation'

export default function DatingPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [similarity, setSimilarity] = useState<1 | -1>(1)
  const [eventType, setEventType] = useState<'date' | 'prom' | 'festival'>('date')

  useEffect(() => {
    if (user) {
      loadMatches()
    }
  }, [user, similarity, eventType])

  const loadMatches = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const newMatches = await MatchingAlgorithm.getMatches({
        userId: user.id,
        connectionType: 'date',
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
    
    try {
      await ConnectionService.createConnection(
        user.id,
        currentMatch.user.id,
        'date',
        currentMatch.compatibilityScore
      )
      
      nextMatch()
    } catch (error) {
      console.error('Error creating connection:', error)
    }
  }

  const handlePass = () => {
    nextMatch()
  }

  const nextMatch = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1)
    } else {
      loadMatches()
    }
  }

  const currentMatch = matches[currentMatchIndex]

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-400" />
              FIND A DATE
            </h1>
            <p className="text-white/70">
              Discover romantic connections and event partners
            </p>
          </div>
          
          <GradientButton variant="secondary">
            <Settings className="w-5 h-5" />
            Preferences
          </GradientButton>
        </motion.div>

        {/* Event Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Event Type</h3>
                <p className="text-white/70 text-sm">
                  What kind of connection are you looking for?
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {[
                { key: 'date', label: 'Casual Date', icon: Heart },
                { key: 'prom', label: 'Prom Partner', icon: Sparkles },
                { key: 'festival', label: 'Festival Buddy', icon: Calendar }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setEventType(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    eventType === key
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Compatibility Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-2">Compatibility Style</h3>
                <p className="text-white/70 text-sm">
                  Do opposites attract or do you prefer similar personalities?
                </p>
              </div>
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setSimilarity(1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    similarity === 1
                      ? 'bg-pink-500 text-white'
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
                  Opposites (-1)
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
              <Heart className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No More Matches</h3>
              <p className="text-white/70 mb-6">
                We've shown you all available matches. Try adjusting your preferences!
              </p>
              <GradientButton onClick={loadMatches}>
                Find More Matches
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
              {currentMatchIndex + 1} of {matches.length} potential matches
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}