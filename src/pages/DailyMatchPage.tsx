import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { ServerStatusIndicator } from '@/components/ui/server-status-indicator'
import { Sparkles, ArrowLeft, Heart, Users, Star, MapPin, GraduationCap, Calendar, Flame, Trophy, Gift } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { supabase, UserProfile, DailyMatch } from '@/lib/supabase'
import { recommendationAPI } from '@/lib/recommendation-api'
import type { RecommendationItem } from '@/lib/recommendation-api'

interface DailyMatchProfile extends UserProfile, RecommendationItem {
  match_reason: string
  suggested_activity: string
}

export default function DailyMatchPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [todayMatch, setTodayMatch] = useState<DailyMatchProfile | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const [matchAction, setMatchAction] = useState<'pass' | 'connect' | 'super_like' | null>(null)
  const [streakCount, setStreakCount] = useState(0)
  const [showStreakReward, setShowStreakReward] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    loadDailyMatch()
    loadStreakCount()
  }, [isAuthenticated, navigate])

  const loadDailyMatch = async () => {
    try {
      setLoading(true)
      
      // Check if user already has a daily match for today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingMatch } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', user?.id)
        .eq('match_date', today)
        .single()

      if (existingMatch && existingMatch.matched_user_id) {
        // Load the matched user profile
        const { data: matchedUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', existingMatch.matched_user_id)
          .single()

        if (matchedUser) {
          setTodayMatch({
            ...matchedUser,
            match_reason: existingMatch.match_reason || 'AI thinks you\'d be perfect together!',
            compatibility_score: existingMatch.compatibility_score || 0.8,
            common_interests: getCommonInterests(matchedUser),
            suggested_activity: generateSuggestedActivity(matchedUser)
          })
        }
      } else {
        // Generate new daily match
        const newMatch = await generateNewDailyMatch()
        if (newMatch) {
          setTodayMatch(newMatch)
        }
      }
    } catch (error) {
      console.error('Error loading daily match:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewDailyMatch = async (): Promise<DailyMatchProfile | null> => {
    try {
      // Use recommendation API for daily match
      const response = await recommendationAPI.getRecommendations({
        user_id: user?.id!,
        recommendation_type: 'daily_match',
        limit: 1,
        filters: {
          min_compatibility_score: 0.6,
          verified_only: true,
          active_recently: true
        }
      })

      if (response.recommendations.length > 0) {
        const rec = response.recommendations[0]
        
        // Get full user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', rec.user_id)
          .single()

        if (userProfile) {
          const dailyMatch: DailyMatchProfile = {
            ...userProfile,
            ...rec,
            match_reason: rec.explanation || generateMatchReason(userProfile),
            suggested_activity: generateSuggestedActivity(userProfile)
          }

        // Save daily match to database
        await supabase
          .from('daily_matches')
          .insert({
            user_id: user?.id,
            matched_user_id: userProfile.id,
            match_date: new Date().toISOString().split('T')[0],
            algorithm_version: 'v1.0',
            compatibility_score: rec.compatibility_score,
            viewed: false,
            created_at: new Date().toISOString()
          })

          return dailyMatch
        }
      }
      
      return null
    } catch (error) {
      console.error('Error generating daily match:', error)
      return null
    }
  }

  const generateSuggestedActivity = (otherUser: UserProfile): string => {
    const activities = [
      '☕ Coffee chat at campus cafe',
      '🍕 Food adventure in the city',
      '🎮 Gaming session together',
      '📚 Study group formation',
      '🎵 Music sharing session',
      '🏃‍♂️ Fitness buddy workout',
      '🎨 Creative project collaboration',
      '🌍 Cultural exchange chat'
    ]
    
    // Pick based on interests
    if (otherUser.interests.includes('Music')) return '🎵 Music sharing session'
    if (otherUser.interests.includes('Sports')) return '🏃‍♂️ Fitness buddy workout'
    if (otherUser.interests.includes('Food')) return '🍕 Food adventure in the city'
    if (otherUser.interests.includes('Gaming')) return '🎮 Gaming session together'
    
    return activities[Math.floor(Math.random() * activities.length)]
  }

  const generateMatchReason = (otherUser: UserProfile): string => {
    const reasons = [
      'AI thinks you\'d be perfect together! ✨',
      'Your interests align perfectly! 🎯',
      'Same academic journey, different perspectives! 🎓',
      'Complementary personalities detected! 💫',
      'Shared campus vibes! 🏛️',
      'Perfect balance of similarities and differences! ⚖️',
      'Your energy levels match! 🔋',
      'Great conversation potential! 💬'
    ]
    
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const loadStreakCount = async () => {
    try {
      const { data: matches } = await supabase
        .from('daily_matches')
        .select('match_date')
        .eq('user_id', user?.id)
        .order('match_date', { ascending: false })

      if (matches) {
        let streak = 0
        const today = new Date()
        
        for (let i = 0; i < matches.length; i++) {
          const matchDate = new Date(matches[i].match_date)
          const diffDays = Math.floor((today.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays === streak) {
            streak++
          } else {
            break
          }
        }
        
        setStreakCount(streak)
      }
    } catch (error) {
      console.error('Error loading streak count:', error)
    }
  }

  const handleMatchAction = async (action: 'pass' | 'connect' | 'super_like') => {
    if (!todayMatch) return

    setMatchAction(action)

    try {
      // Submit feedback to recommendation API
      await recommendationAPI.submitFeedback(
        user?.id!,
        todayMatch.user_id,
        action === 'pass' ? 'pass' : action === 'super_like' ? 'super_like' : 'like'
      )
      
      // Update daily match with action
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('daily_matches')
        .update({ 
          action,
          acted_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('match_date', today)

      if (action === 'connect' || action === 'super_like') {
        // Create connection
        await supabase
          .from('connections')
          .insert({
            user1_id: user?.id,
            user2_id: todayMatch.id,
            connection_type: 'friend',
            status: 'pending',
            compatibility_score: todayMatch.compatibility_score,
            created_at: new Date().toISOString()
          })

        // Show match celebration
        setShowMatch(true)
      } else {
        // Pass - move to next day
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }

      // Update streak
      await loadStreakCount()
      
      // Show streak reward if applicable
      if (streakCount > 0 && streakCount % 7 === 0) {
        setShowStreakReward(true)
      }
    } catch (error) {
      console.error('Error handling match action:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (!todayMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <GradientButton
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
              </GradientButton>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  DAILY MATCH
                </h1>
                <p className="text-white/70">
                  Your AI-powered match of the day
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <Sparkles className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                No Match Available Today
              </h2>
              <p className="text-white/70 mb-8">
                Check back tomorrow for your next AI-powered match! 
                Our algorithm is working hard to find your perfect connection.
              </p>
              <GradientButton
                variant="romantic"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <GradientButton
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </GradientButton>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                DAILY MATCH
              </h1>
              <p className="text-white/70">
                Your AI-powered match of the day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{streakCount} Day Streak</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>AI Match</span>
            </div>
          </div>
        </motion.div>

        {/* Daily Match Card */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-0 overflow-hidden">
              {/* Profile Photo */}
              <div className="relative h-96 bg-gradient-to-br from-yellow-500 to-orange-500">
                {todayMatch.profile_photo ? (
                  <img
                    src={todayMatch.profile_photo}
                    alt={todayMatch.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-24 h-24 text-white/50" />
                  </div>
                )}
                
                {/* AI Match Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">AI Match</span>
                </div>

                {/* Compatibility Score */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">
                    {Math.round(todayMatch.compatibility_score * 100)}%
                  </span>
                </div>

                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {todayMatch.display_name}, {todayMatch.age || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>BITS {todayMatch.campus}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{todayMatch.branch}</span>
                    </div>
                  </div>
                  {todayMatch.bio && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {todayMatch.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Match Reason */}
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Why AI Matched You:
                </h3>
                <p className="text-white/90 text-sm">
                  {todayMatch.match_reason}
                </p>
              </div>

              {/* Common Interests */}
              {todayMatch.common_interests.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Common Interests:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {todayMatch.common_interests.slice(0, 5).map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Activity */}
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Suggested Activity:
                </h3>
                <p className="text-white/90 text-sm">
                  {todayMatch.suggested_activity}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Match Actions */}
        <div className="flex justify-center gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMatchAction('pass')}
            disabled={matchAction !== null}
            className="w-20 h-20 bg-gray-500/20 hover:bg-gray-500/30 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-400 transition-all duration-200 disabled:opacity-50"
          >
            <span className="text-sm font-medium">Pass</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMatchAction('connect')}
            disabled={matchAction !== null}
            className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 disabled:opacity-50"
          >
            <Users className="w-10 h-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMatchAction('super_like')}
            disabled={matchAction !== null}
            className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 disabled:opacity-50"
          >
            <Star className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Match Celebration Modal */}
        <AnimatePresence>
          {showMatch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setShowMatch(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-3xl p-8 max-w-md w-full text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Great Choice! 🎉
                </h2>
                <p className="text-white/90 mb-6">
                  You've connected with {todayMatch.display_name}! 
                  Start a conversation and see where this AI match leads.
                </p>

                <div className="flex gap-3">
                  <GradientButton
                    variant="secondary"
                    onClick={() => setShowMatch(false)}
                    className="flex-1"
                  >
                    Continue
                  </GradientButton>
                  <GradientButton
                    variant="romantic"
                    onClick={() => {
                      setShowMatch(false)
                      navigate('/messages')
                    }}
                    className="flex-1"
                  >
                    Send Message 💬
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak Reward Modal */}
        <ServerStatusIndicator />
        <AnimatePresence>
          {showStreakReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setShowStreakReward(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Streak Achievement! 🏆
                </h2>
                <p className="text-white/90 mb-6">
                  Congratulations! You've maintained a {streakCount}-day streak! 
                  Keep coming back daily for more amazing matches.
                </p>

                <div className="bg-white/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Gift className="w-5 h-5" />
                    <span className="font-medium">Reward: Priority matching for next 3 days!</span>
                  </div>
                </div>

                <GradientButton
                  variant="romantic"
                  onClick={() => setShowStreakReward(false)}
                  className="w-full"
                >
                  Claim Reward! 🎁
                </GradientButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}