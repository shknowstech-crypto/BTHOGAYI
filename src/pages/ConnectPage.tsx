import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Users, ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function ConnectPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    setLoading(false)
  }, [isAuthenticated, navigate])

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
            <span>Social Networking</span>
          </div>
        </motion.div>

        {/* Preference Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Preferences</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/70">Similarity:</span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                    +1 (Similar)
                  </button>
                  <button className="px-4 py-2 bg-white/10 text-white/50 rounded-lg border border-white/20">
                    -1 (Opposite)
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-16"
        >
          <GlassCard className="p-12 max-w-2xl mx-auto">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <UserPlus className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Friend Matching Coming Soon!
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              We're working hard to bring you the best friend-matching experience. 
              Our AI algorithm will help you find people with similar interests, 
              hobbies, and personalities at BITS {user?.campus}.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Personality Matching</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Interest-Based</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Smart Conversations</p>
              </div>
            </div>

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