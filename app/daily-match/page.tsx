'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MatchCard } from '@/components/ui/match-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dice6, Calendar, Flame, Star, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { DailyMatchService, DailyMatchWithUser } from '@/lib/daily-matches'
import { ConnectionService } from '@/lib/connections'
import { useRouter } from 'next/navigation'

export default function DailyMatchPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [dailyMatch, setDailyMatch] = useState<DailyMatchWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (user) {
      loadDailyMatch()
      loadStreak()
    }
  }, [user])

  const loadDailyMatch = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const match = await DailyMatchService.getTodaysMatch(user.id)
      setDailyMatch(match)
    } catch (error) {
      console.error('Error loading daily match:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStreak = async () => {
    if (!user) return
    
    try {
      const streakCount = await DailyMatchService.getUserStreak(user.id)
      setStreak(streakCount)
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }

  const handleConnect = async () => {
    if (!user || !dailyMatch) return
    
    setActing(true)
    try {
      // Create connection
      await ConnectionService.createConnection(
        user.id,
        dailyMatch.matched_user.id,
        'friend',
        dailyMatch.compatibility_score
      )
      
      // Record action
      await DailyMatchService.recordAction(dailyMatch.id, 'connect')
      
      // Load new match for tomorrow
      await loadDailyMatch()
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setActing(false)
    }
  }

  const handlePass = async () => {
    if (!dailyMatch) return
    
    setActing(true)
    try {
      await DailyMatchService.recordAction(dailyMatch.id, 'pass')
      await loadDailyMatch()
    } catch (error) {
      console.error('Error passing:', error)
    } finally {
      setActing(false)
    }
  }

  const generateNewMatch = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await DailyMatchService.generateDailyMatch(user.id)
      await loadDailyMatch()
    } catch (error) {
      console.error('Error generating new match:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Dice6 className="w-10 h-10 text-cyan-400" />
            DAILY MATCH
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover someone new every day with our AI-powered matching algorithm
          </p>
        </motion.div>

        {/* Streak Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="max-w-md mx-auto p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{streak}</span>
            </div>
            <p className="text-white/70">
              Day streak • Keep it going!
            </p>
          </GlassCard>
        </motion.div>

        {/* Daily Match Card */}
        <div className="flex justify-center">
          {loading ? (
            <GlassCard className="p-12 text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-white/70">Finding your daily match...</p>
            </GlassCard>
          ) : !dailyMatch ? (
            <GlassCard className="p-12 text-center max-w-md">
              <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Match Today</h3>
              <p className="text-white/70 mb-6">
                You've already seen today's match or no matches are available.
              </p>
              <GradientButton onClick={generateNewMatch}>
                <RefreshCw className="w-5 h-5" />
                Generate New Match
              </GradientButton>
            </GlassCard>
          ) : dailyMatch.action ? (
            <GlassCard className="p-12 text-center max-w-md">
              <Star className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {dailyMatch.action === 'connect' ? 'Great Choice!' : 'Maybe Next Time'}
              </h3>
              <p className="text-white/70 mb-6">
                {dailyMatch.action === 'connect' 
                  ? `You connected with ${dailyMatch.matched_user.display_name}!`
                  : 'You passed on today\'s match. Come back tomorrow for a new one!'
                }
              </p>
              <div className="text-white/60 text-sm">
                <p>Next match available tomorrow</p>
              </div>
            </GlassCard>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Special Daily Match Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Today's Special Match
                </div>
              </div>

              <MatchCard
                user={dailyMatch.matched_user}
                compatibilityScore={dailyMatch.compatibility_score}
                matchReasons={[
                  'AI-selected daily match',
                  `${Math.round(dailyMatch.compatibility_score * 100)}% compatibility`,
                  'Perfect timing for connection'
                ]}
                onLike={handleConnect}
                onPass={handlePass}
                className="mt-8"
              />
            </motion.div>
          )}
        </div>

        {/* Daily Match Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              How Daily Matches Work
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Dice6 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">AI Selection</h4>
                <p className="text-white/70 text-sm">
                  Our algorithm picks the best match for you each day
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">One Per Day</h4>
                <p className="text-white/70 text-sm">
                  Quality over quantity - one special match daily
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Build Streaks</h4>
                <p className="text-white/70 text-sm">
                  Daily engagement builds your streak and improves matches
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}