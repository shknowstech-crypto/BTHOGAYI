'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'

interface MessageLimitIndicatorProps {
  currentCount: number
  maxCount: number
  onPlatformSelect?: (platform: string) => void
}

export function MessageLimitIndicator({ 
  currentCount, 
  maxCount, 
  onPlatformSelect 
}: MessageLimitIndicatorProps) {
  const remaining = maxCount - currentCount
  const percentage = (currentCount / maxCount) * 100

  const platforms = [
    { name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-500' },
    { name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-emerald-500' },
    { name: 'Discord', icon: '🎮', color: 'from-indigo-500 to-blue-500' },
    { name: 'Phone', icon: '📱', color: 'from-gray-500 to-slate-500' }
  ]

  if (remaining > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white/70 text-sm">
            {remaining} message{remaining !== 1 ? 's' : ''} remaining
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <span className="text-white/60 text-xs">
          {currentCount}/{maxCount}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <GlassCard className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Message Limit Reached!
        </h3>
        <p className="text-white/70 mb-6">
          You've used all {maxCount} messages. Choose a platform to continue your conversation:
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <GradientButton
              key={platform.name}
              variant="secondary"
              size="sm"
              onClick={() => onPlatformSelect?.(platform.name.toLowerCase())}
              className="flex items-center gap-2"
            >
              <span>{platform.icon}</span>
              {platform.name}
              <ExternalLink className="w-3 h-3" />
            </GradientButton>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}