'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (isVisible) {
      setStage(0)
      const timer1 = setTimeout(() => setStage(1), 500)
      const timer2 = setTimeout(() => setStage(2), 1500)
      const timer3 = setTimeout(() => {
        setStage(3)
        onComplete()
      }, 3000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
        >
          <div className="text-center">
            {/* Hearts Animation */}
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: stage >= 1 ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <Heart className="w-24 h-24 text-pink-500 mx-auto fill-current" />
                
                {/* Sparkles around heart */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 45}deg) translateY(-60px)`
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: stage >= 2 ? [0, 1, 0] : 0,
                      scale: stage >= 2 ? [0, 1, 0] : 0
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.1,
                      repeat: stage >= 2 ? Infinity : 0,
                      repeatDelay: 2
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 20 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                It's a Match! 🎉
              </h2>
              <p className="text-xl text-white/80 mb-2">
                {user1Name} & {user2Name}
              </p>
              <p className="text-white/60">
                You've connected! Start a conversation now.
              </p>
            </motion.div>

            {/* Confetti Effect */}
            {stage >= 2 && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -100, -200],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}