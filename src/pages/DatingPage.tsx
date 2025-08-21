import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Heart, ArrowLeft, Sparkles, Calendar, Coffee } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function DatingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

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
                FIND A DATE - Romantic Connections
              </h1>
              <p className="text-white/70">
                Discover meaningful romantic connections at BITS {user?.campus}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Heart className="w-5 h-5 text-pink-400" />
            <span>Dating & Romance</span>
          </div>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
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
              className="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Dating Feature Coming Soon! 💕
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              We're crafting the perfect dating experience for BITS students. 
              Find your special someone for dates, proms, and meaningful relationships 
              with our advanced compatibility matching.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">AI Compatibility</p>
              </div>
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Event Matching</p>
              </div>
              <div className="text-center">
                <Coffee className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Date Planning</p>
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