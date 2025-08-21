'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles, Star } from 'lucide-react'
import { GlassCard } from './glass-card'

interface ConnectionAnimationProps {
  isVisible: boolean
  user1Name: string
  user2Name: string
  onComplete: () => void
}

export function ConnectionAnimation({ 
  isVisible, 
  user1Name, 
  user2Name, 
  onComplete 
}: ConnectionAnimationProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onAnimationComplete={() => {
        setTimeout(onComplete, 3000)
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <GlassCard className="p-12 text-center max-w-md">
          {/* Animated Heart */}
          <motion.div
            className="relative mb-8"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-white fill-current" />
            </div>
            
            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.cos(i * 45 * Math.PI / 180) * 60)],
                  y: [0, (Math.sin(i * 45 * Math.PI / 180) * 60)],
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {i % 2 === 0 ? (
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Star className="w-3 h-3 text-pink-400" />
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white mb-4"
          >
            It's a Match! 🎉
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-white/80 mb-6"
          >
            You and <span className="font-semibold text-purple-300">{user2Name}</span> are now connected!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-white/60 text-sm"
          >
            Start your conversation with 5 meaningful messages
          </motion.div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}