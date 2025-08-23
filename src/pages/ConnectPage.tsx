import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Users, ArrowLeft, Heart, MessageCircle, UserPlus, X, Check, Star, MapPin, GraduationCap, User } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/supabase'

interface PotentialMatch extends UserProfile {
  compatibility_score: number
  common_interests: string[]
}

export default function ConnectPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedUser, setMatchedUser] = useState<PotentialMatch | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    loadPotentialMatches()
  }, [isAuthenticated, navigate])

  const loadPotentialMatches = async () => {
    try {
      setLoading(true)
      
      // Get users from the same campus with similar interests
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('campus', user?.campus)
        .neq('id', user?.id)
        .eq('is_active', true)
        .limit(50)

      if (error) throw error

      // Calculate compatibility scores and filter by preferences
      const matches = users
        .map(u => ({
          ...u,
          compatibility_score: calculateCompatibility(u),
          common_interests: getCommonInterests(u)
        }))
        .filter(m => m.compatibility_score > 0.3) // Only show compatible matches
        .sort((a, b) => b.compatibility_score - a.compatibility_score)

      setPotentialMatches(matches)
    } catch (error) {
      console.error('Error loading potential matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCompatibility = (otherUser: UserProfile): number => {
    if (!user) return 0
    
    let score = 0
    let factors = 0

    // Interest similarity
    if (user.interests && otherUser.interests) {
      const common = user.interests.filter(i => otherUser.interests.includes(i))
      score += (common.length / Math.max(user.interests.length, otherUser.interests.length)) * 0.4
      factors += 0.4
    }

    // Year similarity (closer years = higher score)
    const yearDiff = Math.abs((user.year || 1) - (otherUser.year || 1))
    score += Math.max(0, (4 - yearDiff) / 4) * 0.3
    factors += 0.3

    // Branch similarity
    if (user.branch === otherUser.branch) {
      score += 0.2
    }
    factors += 0.2

    // Activity level (last seen)
    const lastSeen = new Date(otherUser.last_seen).getTime()
    const now = Date.now()
    const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24)
    if (daysSince < 7) score += 0.1
    factors += 0.1

    return factors > 0 ? score / factors : 0
  }

  const getCommonInterests = (otherUser: UserProfile): string[] => {
    if (!user?.interests || !otherUser.interests) return []
    return user.interests.filter(i => otherUser.interests.includes(i))
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= potentialMatches.length) return

    const currentUser = potentialMatches[currentIndex]
    setSwipeDirection(direction)

    if (direction === 'right') {
      // Check if it's a mutual match
      const isMatch = await checkForMatch(currentUser.id)
      if (isMatch) {
        setMatchedUser(currentUser)
        setShowMatch(true)
      }
    }

    // Move to next user
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setSwipeDirection(null)
    }, 300)
  }

  const checkForMatch = async (otherUserId: string): Promise<boolean> => {
    try {
      // Check if the other user has already swiped right on current user
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user1_id.eq.${otherUserId},user2_id.eq.${user?.id}),and(user1_id.eq.${user?.id},user2_id.eq.${otherUserId})`)
        .eq('connection_type', 'friend')
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
            connection_type: 'friend',
            status: 'pending',
            compatibility_score: potentialMatches[currentIndex].compatibility_score,
            created_at: new Date().toISOString()
          })
        return false
      }
    } catch (error) {
      console.error('Error checking for match:', error)
      return false
    }
  }

  const resetSwipe = () => {
    setCurrentIndex(0)
    setSwipeDirection(null)
    setShowMatch(false)
    setMatchedUser(null)
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

  if (potentialMatches.length === 0) {
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
                  CONNECT - Find Friends
                </h1>
                <p className="text-white/70">
                  Discover people with similar interests at BITS {user?.campus}
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
              <Users className="w-24 h-24 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                No More Profiles to Show
              </h2>
              <p className="text-white/70 mb-8">
                We've shown you all the potential friends in your area. 
                Check back later for new connections!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetSwipe}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  if (currentIndex >= potentialMatches.length) {
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
                  CONNECT - Find Friends
                </h1>
                <p className="text-white/70">
                  Discover people with similar interests at BITS {user?.campus}
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
              <Users className="w-24 h-24 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                You've Seen All Profiles!
              </h2>
              <p className="text-white/70 mb-8">
                Great job exploring! You've reviewed all potential friends in your area. 
                New people join every day, so check back soon!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetSwipe}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentUser = potentialMatches[currentIndex]

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
                CONNECT - Find Friends
              </h1>
              <p className="text-white/70">
                Discover people with similar interests at BITS {user?.campus}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-5 h-5" />
            <span>{currentIndex + 1} of {potentialMatches.length}</span>
          </div>
        </motion.div>

        {/* User Card */}
        <div className="flex justify-center mb-8">
          <motion.div
            key={currentUser.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-0 overflow-hidden">
              {/* Profile Photo */}
              <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-500">
                {currentUser.profile_photo ? (
                  <img
                    src={currentUser.profile_photo}
                    alt={currentUser.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-24 h-24 text-white/50" />
                  </div>
                )}
                
                {/* Compatibility Score */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">
                    {Math.round(currentUser.compatibility_score * 100)}%
                  </span>
                </div>

                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentUser.display_name}, {currentUser.age || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>BITS {currentUser.campus}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{currentUser.branch}</span>
                    </div>
                  </div>
                  {currentUser.bio && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {currentUser.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Common Interests */}
              {currentUser.common_interests.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-white/80 text-sm font-medium mb-2">Common Interests:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.common_interests.slice(0, 5).map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                    {swipeDirection === 'right' ? <Check /> : <X />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Swipe Actions */}
        <div className="flex justify-center gap-6">
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
            className="w-16 h-16 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-400 rounded-full flex items-center justify-center text-green-400 transition-all duration-200"
          >
            <Check className="w-8 h-8" />
          </motion.button>
        </div>

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
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  It's a Match! 🎉
                </h2>
                <p className="text-white/90 mb-6">
                  You and {matchedUser.display_name} are now connected! 
                  Start a conversation and see where it leads.
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
                    Send Message
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}