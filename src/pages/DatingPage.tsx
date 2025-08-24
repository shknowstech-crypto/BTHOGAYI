import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Heart, ArrowLeft, Users, Sparkles, User, Star, MapPin, GraduationCap, Calendar, MessageCircle, Crown, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/supabase'

interface DatingMatch extends UserProfile {
  compatibility_score: number
  romantic_compatibility: number
  common_interests: string[]
  potential_activities: string[]
}

export default function DatingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [datingMatches, setDatingMatches] = useState<DatingMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedUser, setMatchedUser] = useState<DatingMatch | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showRelationshipSetup, setShowRelationshipSetup] = useState(false)
  const [preferences, setPreferences] = useState({
    gender_preference: user?.preferences?.gender_preference || 'any',
    age_range: user?.preferences?.age_range || [18, 30],
    max_distance: user?.preferences?.max_distance || 50,
    romantic_intent: 'serious' as 'casual' | 'serious' | 'friends_first'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    // Check if user has set dating as an intent
    if (!user?.preferences?.looking_for?.includes('dating')) {
      // User hasn't selected dating as an intent
      setShowRelationshipSetup(true)
      return
    }

    loadDatingMatches()
  }, [isAuthenticated, navigate, user])

  const loadDatingMatches = async () => {
    try {
      setLoading(true)
      
      // Get users looking for dating with gender preference matching
      let query = supabase
        .from('users')
        .select('*')
        .eq('campus', user?.campus)
        .neq('id', user?.id)
        .eq('is_active', true)
        .contains('preferences', { looking_for: ['dating'] })

      // Apply gender preference filter
      if (preferences.gender_preference !== 'any') {
        query = query.eq('gender', preferences.gender_preference)
      }

      const { data: users, error } = await query.limit(50)

      if (error) throw error

      // Calculate romantic compatibility scores
      const matches = users
        .map((u: UserProfile) => ({
          ...u,
          compatibility_score: calculateRomanticCompatibility(u),
          romantic_compatibility: calculateRomanticCompatibility(u),
          common_interests: getCommonInterests(u),
          potential_activities: generatePotentialActivities(u)
        }))
        .filter((m: any) => m.compatibility_score > 0.5) // Higher threshold for dating
        .sort((a: any, b: any) => b.compatibility_score - a.compatibility_score)

      setDatingMatches(matches)
    } catch (error) {
      console.error('Error loading dating matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRomanticCompatibility = (otherUser: UserProfile): number => {
    if (!user) return 0
    
    let score = 0
    let factors = 0

    // Interest similarity (35%)
    if (user.interests && otherUser.interests) {
      const common = user.interests.filter((i: string) => otherUser.interests.includes(i))
      score += (common.length / Math.max(user.interests.length, otherUser.interests.length)) * 0.35
      factors += 0.35
    }

    // Age compatibility (25%) - prefer similar age for dating
    const ageDiff = Math.abs((user.age || 20) - (otherUser.age || 20))
    score += Math.max(0, (10 - ageDiff) / 10) * 0.25
    factors += 0.25

    // Branch diversity (20%) - prefer different branches for variety
    if (user.branch !== otherUser.branch) {
      score += 0.20
    }
    factors += 0.20

    // Activity level (20%) - prefer active users for dating
    const lastSeen = new Date(otherUser.last_seen).getTime()
    const now = Date.now()
    const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24)
    if (daysSince < 2) score += 0.20
    factors += 0.20

    return factors > 0 ? score / factors : 0
  }

  const getCommonInterests = (otherUser: UserProfile): string[] => {
    if (!user?.interests || !otherUser.interests) return []
    return user.interests.filter((i: string) => otherUser.interests.includes(i))
  }

  const generatePotentialActivities = (otherUser: UserProfile): string[] => {
    const activities: string[] = []
    
    if (otherUser.interests.includes('Music')) activities.push('🎵 Concert together')
    if (otherUser.interests.includes('Sports')) activities.push('⚽ Sports activity')
    if (otherUser.interests.includes('Food')) activities.push('🍕 Food adventure')
    if (otherUser.interests.includes('Movies')) activities.push('🎬 Movie night')
    if (otherUser.interests.includes('Travel')) activities.push('✈️ Weekend trip')
    if (otherUser.interests.includes('Gaming')) activities.push('🎮 Gaming session')
    if (otherUser.interests.includes('Art')) activities.push('🎨 Art gallery visit')
    if (otherUser.interests.includes('Dancing')) activities.push('💃 Dance class')
    
    if (activities.length === 0) {
      activities.push('☕ Coffee date', '🍽️ Dinner together', '🎭 Cultural event')
    }
    
    return activities.slice(0, 3)
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= datingMatches.length) return

    const currentUser = datingMatches[currentIndex]
    setSwipeDirection(direction)

    if (direction === 'right') {
      // Check if it's a mutual match
      const isMatch = await checkForDatingMatch(currentUser.id)
      if (isMatch) {
        setMatchedUser(currentUser)
        setShowMatch(true)
      }
    }

            // Move to next user
        setTimeout(() => {
          setCurrentIndex((prev: number) => prev + 1)
          setSwipeDirection(null)
        }, 300)
  }

  const checkForDatingMatch = async (otherUserId: string): Promise<boolean> => {
    try {
      // Check if the other user has already swiped right on current user
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user1_id.eq.${otherUserId},user2_id.eq.${user?.id}),and(user1_id.eq.${user?.id},user2_id.eq.${otherUserId})`)
        .eq('connection_type', 'date')
        .eq('status', 'pending')
        .single()

      if (existingConnection) {
        // Update existing connection to accepted
        await supabase
          .from('connections')
          .update({ status: 'accepted', responded_at: new Date().toISOString() })
          .eq('id', existingConnection.id)
        return true
      } else {
        // Create new connection request
        await supabase
          .from('connections')
          .insert({
            user1_id: user?.id,
            user2_id: otherUserId,
            connection_type: 'date',
            status: 'pending',
            compatibility_score: datingMatches[currentIndex].compatibility_score,
            created_at: new Date().toISOString()
          })
        return false
      }
    } catch (error) {
      console.error('Error checking for dating match:', error)
      return false
    }
  }

  const updatePreferences = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('users')
        .update({
          preferences: {
            ...user.preferences,
            gender_preference: preferences.gender_preference,
            age_range: preferences.age_range,
            max_distance: preferences.max_distance
          }
        })
        .eq('id', user.id)

      // Reload matches with new preferences
      await loadDatingMatches()
      setShowPreferences(false)
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  const resetDating = () => {
    setCurrentIndex(0)
    setSwipeDirection(null)
    setShowMatch(false)
    setMatchedUser(null)
  }

  // Show relationship setup modal if needed
  if (showRelationshipSetup) {
    return (
      <AuthGuard requireAuth={true} requireCompleteProfile={true}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready for Romance? 💕
              </h2>
              <p className="text-white/70 mb-6">
                To access the dating section, you need to update your preferences to include "dating" as one of your interests.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">What you need to do:</h3>
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• Go to your profile settings</li>
                  <li>• Add "dating" to your looking for preferences</li>
                  <li>• Answer additional relationship questions</li>
                  <li>• Set your dating preferences (age range, etc.)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <GradientButton
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </GradientButton>
              <GradientButton
                variant="romantic"
                onClick={() => navigate('/onboarding')}
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Update Preferences
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </AuthGuard>
    )
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

  if (datingMatches.length === 0) {
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
                  FIND LOVE - Dating & Prom
                </h1>
                <p className="text-white/70">
                  Discover romantic connections for dates, proms, and special events
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
              <Heart className="w-24 h-24 text-pink-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                No More Dating Profiles
              </h2>
              <p className="text-white/70 mb-8">
                We've shown you all the potential romantic matches in your area. 
                Check back later for new dating opportunities!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetDating}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  if (currentIndex >= datingMatches.length) {
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
                  FIND LOVE - Dating & Prom
                </h1>
                <p className="text-white/70">
                  Discover romantic connections for dates, proms, and special events
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
              <Heart className="w-24 h-24 text-pink-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                You've Seen All Profiles!
              </h2>
              <p className="text-white/70 mb-8">
                Great job exploring! You've reviewed all potential romantic matches in your area. 
                New people join every day, so check back soon!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetDating}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentMatch = datingMatches[currentIndex]

  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={true}>
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
                FIND LOVE - Dating & Prom
              </h1>
              <p className="text-white/70">
                Discover romantic connections for dates, proms, and special events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <GradientButton
              variant="secondary"
              onClick={() => setShowPreferences(true)}
              size="sm"
            >
              <Crown className="w-4 h-4" />
              Preferences
            </GradientButton>
            <div className="flex items-center gap-2 text-white/70">
              <Heart className="w-5 h-5 text-pink-400" />
              <span>{currentIndex + 1} of {datingMatches.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Dating Match Card */}
        <div className="flex justify-center mb-8">
          <motion.div
            key={currentMatch.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-0 overflow-hidden">
              {/* Profile Photo */}
              <div className="relative h-96 bg-gradient-to-br from-pink-500 to-purple-500">
                {currentMatch.profile_photo ? (
                  <img
                    src={currentMatch.profile_photo}
                    alt={currentMatch.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-24 h-24 text-white/50" />
                  </div>
                )}
                
                {/* Romantic Compatibility Score */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-400 fill-current" />
                  <span className="text-white text-sm font-medium">
                    {Math.round(currentMatch.romantic_compatibility * 100)}%
                  </span>
                </div>

                {/* Dating Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full px-3 py-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Date</span>
                </div>

                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentMatch.display_name}, {currentMatch.age || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>BITS {currentMatch.campus}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{currentMatch.branch}</span>
                    </div>
                  </div>
                  {currentMatch.bio && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {currentMatch.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Common Interests */}
              {currentMatch.common_interests.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Common Interests:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.common_interests.slice(0, 5).map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Activities */}
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Perfect for:
                </h3>
                <div className="space-y-2">
                  {currentMatch.potential_activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-white/70 text-sm"
                    >
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Swipe Animation */}
            <AnimatePresence>
              {swipeDirection && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute inset-0 flex items-center justify-center ${
                    swipeDirection === 'right' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <div className={`text-8xl ${
                    swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
                  } rounded-full p-8 border-4 ${
                    swipeDirection === 'right' ? 'border-green-400' : 'border-red-400'
                  }`}>
                    {swipeDirection === 'right' ? <Heart /> : <X />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Swipe Actions */}
        <div className="flex justify-center gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 rounded-full flex items-center justify-center text-red-400 transition-all duration-200"
          >
            <X className="w-8 h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200"
          >
            <Heart className="w-10 h-10" />
          </motion.button>
        </div>

        {/* Preferences Modal */}
        <AnimatePresence>
          {showPreferences && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setShowPreferences(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Dating Preferences
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Gender Preference
                    </label>
                    <select
                      value={preferences.gender_preference}
                      onChange={(e) => setPreferences(prev => ({ ...prev, gender_preference: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="any">Any Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Age Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={preferences.age_range[0]}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          age_range: [parseInt(e.target.value), prev.age_range[1]] 
                        }))}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Min Age"
                      />
                      <span className="text-white/60 self-center">to</span>
                      <input
                        type="number"
                        value={preferences.age_range[1]}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          age_range: [prev.age_range[0], parseInt(e.target.value)] 
                        }))}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Max Age"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GradientButton
                      variant="secondary"
                      onClick={() => setShowPreferences(false)}
                      className="flex-1"
                    >
                      Cancel
                    </GradientButton>
                    <GradientButton
                      variant="romantic"
                      onClick={updatePreferences}
                      className="flex-1"
                    >
                      Update Preferences
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Modal */}
        <AnimatePresence>
          {showMatch && matchedUser && (
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
                className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-3xl p-8 max-w-md w-full text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  It's a Love Match! 💕
                </h2>
                <p className="text-white/90 mb-6">
                  You and {matchedUser.display_name} are romantically compatible! 
                  Start a conversation and plan your perfect date.
                </p>

                <div className="flex gap-3">
                  <GradientButton
                    variant="secondary"
                    onClick={() => setShowMatch(false)}
                    className="flex-1"
                  >
                    Keep Browsing
                  </GradientButton>
                  <GradientButton
                    variant="romantic"
                    onClick={() => {
                      setShowMatch(false)
                      navigate('/messages')
                    }}
                    className="flex-1"
                  >
                    Start Chatting 💬
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </AuthGuard>
  )
}