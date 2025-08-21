'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { MessageCircle, ExternalLink } from 'lucide-react'

interface MessageLimitIndicatorProps {
  currentCount: number
  maxCount: number
  onPlatformSelect: (platform: string) => void
}

export function MessageLimitIndicator({ 
  currentCount, 
  maxCount, 
  onPlatformSelect 
}: MessageLimitIndicatorProps) {
  const isLimitReached = currentCount >= maxCount
  const remaining = maxCount - currentCount

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-500' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-emerald-500' },
    { id: 'discord', name: 'Discord', icon: '🎮', color: 'from-indigo-500 to-purple-500' },
    { id: 'phone', name: 'Phone', icon: '📱', color: 'from-blue-500 to-cyan-500' }
  ]

  if (!isLimitReached) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Messages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: maxCount }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentCount ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-white/70 text-sm ml-2">
              {remaining} left
            </span>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Message Limit Reached! 💬
        </h3>
        <p className="text-white/70">
          Continue your conversation on another platform
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <motion.button
            key={platform.id}
            onClick={() => onPlatformSelect(platform.id)}
            className={`p-4 bg-gradient-to-r ${platform.color} rounded-xl text-white font-medium flex items-center gap-2 justify-center`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{platform.icon}</span>
            <span>{platform.name}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        ))}
      </div>
    </GlassCard>
  )
}