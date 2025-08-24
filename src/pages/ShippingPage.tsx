import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Ship, ArrowLeft, Heart, Users, Sparkles, User, MessageCircle, Crown, Star, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { UserProfile, Ship as ShipType } from '@/lib/supabase'
import { AuthGuard } from '@/components/auth/auth-guard'

interface ShipCandidate extends UserProfile {
  compatibility_score: number
  ship_reasons: string[]
}

export default function ShippingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shipCandidates, setShipCandidates] = useState<ShipCandidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showShipModal, setShowShipModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<ShipCandidate | null>(null)
  const [shipMessage, setShipMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [myShips, setMyShips] = useState<ShipType[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    loadShipCandidates()
    loadMyShips()
  }, [isAuthenticated, navigate])

  const loadShipCandidates = async () => {
    try {
      setLoading(true)
      
      // Get users from the same campus who are looking for dating
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('campus', user?.campus)
        .neq('id', user?.id)
        .eq('is_active', true)
        .contains('preferences', { looking_for: ['dating'] })
        .limit(50)

      if (error) throw error

      // Calculate compatibility scores and generate ship reasons
      const candidates = users
        .map(u => ({
          ...u,
          compatibility_score: calculateDatingCompatibility(u),
          ship_reasons: generateShipReasons(u)
        }))
        .filter(c => c.compatibility_score > 0.4) // Only show highly compatible matches
        .sort((a, b) => b.compatibility_score - a.compatibility_score)

      setShipCandidates(candidates)
    } catch (error) {
      console.error('Error loading ship candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyShips = async () => {
    try {
      const { data: ships, error } = await supabase
        .from('ships')
        .select('*')
        .eq('shipper_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyShips(ships || [])
    } catch (error) {
      console.error('Error loading my ships:', error)
    }
  }

  const calculateDatingCompatibility = (otherUser: UserProfile): number => {
    if (!user) return 0
    
    let score = 0
    let factors = 0

    // Interest similarity (40%)
    if (user.interests && otherUser.interests) {
      const common = user.interests.filter(i => otherUser.interests.includes(i))
      score += (common.length / Math.max(user.interests.length, otherUser.interests.length)) * 0.4
      factors += 0.4
    }

    // Year compatibility (25%) - prefer similar years
    const yearDiff = Math.abs((user.year || 1) - (otherUser.year || 1))
    score += Math.max(0, (4 - yearDiff) / 4) * 0.25
    factors += 0.25

    // Branch diversity (15%) - prefer different branches for variety
    if (user.branch !== otherUser.branch) {
      score += 0.15
    }
    factors += 0.15

    // Activity level (20%) - prefer active users
    const lastSeen = new Date(otherUser.last_seen).getTime()
    const now = Date.now()
    const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24)
    if (daysSince < 3) score += 0.2
    factors += 0.2

    return factors > 0 ? score / factors : 0
  }

  const generateShipReasons = (otherUser: UserProfile): string[] => {
    const reasons: string[] = []
    
    if (user?.interests && otherUser.interests) {
      const common = user.interests.filter(i => otherUser.interests.includes(i))
      if (common.length >= 2) {
        reasons.push(`You both love ${common.slice(0, 2).join(' & ')}`)
      }
    }

    if (user?.branch !== otherUser.branch) {
      reasons.push(`Perfect balance: ${user?.branch} + ${otherUser.branch}`)
    }

    if (Math.abs((user?.year || 1) - (otherUser.year || 1)) <= 1) {
      reasons.push('Same academic journey')
    }

    if (reasons.length === 0) {
      reasons.push('Great vibes detected! ✨')
    }

    return reasons
  }

  const handleShip = async (candidate: ShipCandidate) => {
    setSelectedCandidate(candidate)
    setShowShipModal(true)
  }

  const submitShip = async () => {
    if (!selectedCandidate || !shipMessage.trim()) return

    try {
      const { error } = await supabase
        .from('ships')
        .insert({
          shipper_id: user?.id,
          user1_id: user?.id,
          user2_id: selectedCandidate.id,
          is_anonymous: isAnonymous,
          message: shipMessage,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Refresh ships list
      await loadMyShips()
      
      // Close modal and move to next candidate
      setShowShipModal(false)
      setSelectedCandidate(null)
      setShipMessage('')
      setIsAnonymous(false)
      
      // Move to next candidate
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error creating ship:', error)
    }
  }

  const resetShips = () => {
    setCurrentIndex(0)
    setShowShipModal(false)
    setSelectedCandidate(null)
    setShipMessage('')
    setIsAnonymous(false)
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

  if (shipCandidates.length === 0) {
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
                  SHIPPING - Matchmaking
                </h1>
                <p className="text-white/70">
                  Let your friends play cupid and ship you with others
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
              <Ship className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                No More Dating Profiles
              </h2>
              <p className="text-white/70 mb-8">
                We've shown you all the potential dating matches in your area. 
                Check back later for new romantic opportunities!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetShips}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  if (currentIndex >= shipCandidates.length) {
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
                  SHIPPING - Matchmaking
                </h1>
                <p className="text-white/70">
                  Let your friends play cupid and ship you with others
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
              <Ship className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                You've Seen All Profiles!
              </h2>
              <p className="text-white/70 mb-8">
                Great job exploring! You've reviewed all potential dating matches in your area. 
                New people join every day, so check back soon!
              </p>
              <GradientButton
                variant="romantic"
                onClick={resetShips}
              >
                Start Over
              </GradientButton>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentCandidate = shipCandidates[currentIndex]

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
                SHIPPING - Matchmaking
              </h1>
              <p className="text-white/70">
                Let your friends play cupid and ship you with others
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Ship className="w-5 h-5 text-purple-400" />
            <span>{currentIndex + 1} of {shipCandidates.length}</span>
          </div>
        </motion.div>

        {/* Ship Candidate Card */}
        <div className="flex justify-center mb-8">
          <motion.div
            key={currentCandidate.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-0 overflow-hidden">
              {/* Profile Photo */}
              <div className="relative h-96 bg-gradient-to-br from-pink-500 to-purple-500">
                {currentCandidate.profile_photo ? (
                  <img
                    src={currentCandidate.profile_photo}
                    alt={currentCandidate.display_name}
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
                    {Math.round(currentCandidate.compatibility_score * 100)}%
                  </span>
                </div>

                {/* Ship Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full px-3 py-1 flex items-center gap-1">
                  <Ship className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Ship</span>
                </div>

                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentCandidate.display_name}, {currentCandidate.age || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <span>BITS {currentCandidate.campus}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{currentCandidate.branch}</span>
                    </div>
                  </div>
                  {currentCandidate.bio && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {currentCandidate.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Ship Reasons */}
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  Why You Should Ship:
                </h3>
                <div className="space-y-2">
                  {currentCandidate.ship_reasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-white/70 text-sm"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Ship Actions */}
        <div className="flex justify-center gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="w-16 h-16 bg-gray-500/20 hover:bg-gray-500/30 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-400 transition-all duration-200"
          >
            <X className="w-8 h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleShip(currentCandidate)}
            className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200"
          >
            <Ship className="w-10 h-10" />
          </motion.button>
        </div>

        {/* My Ships Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                My Ships
              </h2>
              <span className="text-white/60 text-sm">{myShips.length} ships sent</span>
            </div>
            
            {myShips.length > 0 ? (
              <div className="space-y-3">
                {myShips.slice(0, 3).map((ship) => (
                  <div key={ship.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Ship className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {ship.is_anonymous ? 'Anonymous Ship' : 'Your Ship'}
                        </p>
                        <p className="text-white/60 text-xs">
                          {new Date(ship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      ship.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      ship.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {ship.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">
                You haven't sent any ships yet. Start shipping people together! 🚢
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Ship Modal */}
        <AnimatePresence>
          {showShipModal && selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setShowShipModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Ship className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Ship with {selectedCandidate.display_name}!
                  </h2>
                  <p className="text-white/90">
                    Send a message explaining why you think they'd be perfect together
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={shipMessage}
                      onChange={(e) => setShipMessage(e.target.value)}
                      placeholder="Tell them why they should connect..."
                      className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="anonymous" className="text-white/80 text-sm">
                      Send anonymously
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <GradientButton
                      variant="secondary"
                      onClick={() => setShowShipModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </GradientButton>
                    <GradientButton
                      variant="romantic"
                      onClick={submitShip}
                      disabled={!shipMessage.trim()}
                      className="flex-1"
                    >
                      Send Ship! 🚢
                    </GradientButton>
                  </div>
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