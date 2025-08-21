'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Crown, Star, MessageCircle, Heart, Zap, Check } from 'lucide-react'

interface PremiumUpgradeProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

const premiumFeatures = [
  {
    icon: MessageCircle,
    title: 'Unlimited Messages',
    description: 'Chat without the 5-message limit',
    highlight: true
  },
  {
    icon: Heart,
    title: 'Super Likes',
    description: 'Stand out with special likes',
    highlight: false
  },
  {
    icon: Star,
    title: 'Priority Matching',
    description: 'Get shown to more people',
    highlight: false
  },
  {
    icon: Zap,
    title: 'Advanced Filters',
    description: 'Filter by interests, year, branch',
    highlight: false
  }
]

export function PremiumUpgrade({ isOpen, onClose, onUpgrade }: PremiumUpgradeProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          {/* Crown Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Upgrade to Premium
          </h2>
          <p className="text-white/70 mb-8">
            Unlock unlimited messaging and premium features
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  feature.highlight 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' 
                    : 'bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  feature.highlight 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-white/10'
                }`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white">{feature.title}</h4>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
                <Check className="w-5 h-5 text-green-400" />
              </motion.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  ₹99<span className="text-lg text-white/70">/month</span>
                </div>
                <p className="text-white/70 text-sm">
                  Cancel anytime • Student discount applied
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <GradientButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </GradientButton>
            <GradientButton
              variant="romantic"
              onClick={onUpgrade}
              className="flex-1"
            >
              <Crown className="w-4 h-4" />
              Upgrade Now
            </GradientButton>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}