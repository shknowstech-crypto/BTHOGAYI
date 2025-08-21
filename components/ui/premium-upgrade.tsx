'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Crown, Star, MessageCircle, Heart, Zap, X } from 'lucide-react'

interface PremiumUpgradeProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

const premiumFeatures = [
  {
    icon: MessageCircle,
    title: 'Unlimited Messages',
    description: 'No 5-message limit, chat as much as you want',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Heart,
    title: 'Super Likes',
    description: 'Stand out with 5 super likes per day',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Star,
    title: 'Priority Matching',
    description: 'Get shown to more people and better matches',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Zap,
    title: 'Advanced Filters',
    description: 'Filter by interests, year, branch, and more',
    color: 'from-purple-500 to-indigo-500'
  }
]

export function PremiumUpgrade({ isOpen, onClose, onUpgrade }: PremiumUpgradeProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6 relative overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-white/70">
              Unlock the full BITSPARK experience
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
              <div className="text-4xl font-bold text-white mb-2">
                ₹99
                <span className="text-lg text-white/60 font-normal">/month</span>
              </div>
              <p className="text-white/70 text-sm">
                Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <GradientButton
            size="lg"
            variant="romantic"
            className="w-full"
            onClick={onUpgrade}
          >
            <Crown className="w-5 h-5" />
            Start Free Trial
          </GradientButton>

          <p className="text-white/50 text-xs text-center mt-4">
            By upgrading, you agree to our Terms of Service and Privacy Policy
          </p>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}