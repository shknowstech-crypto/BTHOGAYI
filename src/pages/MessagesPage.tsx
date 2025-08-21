import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MessageCircle, ArrowLeft, Send, Clock } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function MessagesPage() {
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
                Messages
              </h1>
              <p className="text-white/70">
                Your conversations with 5-message limit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <MessageCircle className="w-5 h-5" />
            <span>Smart Messaging</span>
          </div>
        </motion.div>

        {/* Message Limit Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">5-Message System</h3>
                <p className="text-white/70 text-sm">
                  Make every message count! After 5 messages, you'll be redirected to external platforms.
                </p>
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
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <MessageCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Messaging System Coming Soon! 💬
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Our smart messaging system with 5-message limit is being developed. 
              Make meaningful connections with thoughtful conversations before 
              moving to your preferred platform.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="text-center">
                <Send className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Smart Messaging</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm">5-Message Limit</p>
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