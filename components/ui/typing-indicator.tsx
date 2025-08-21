'use client'

import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  userName: string
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {userName.charAt(0)}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-white/70 text-sm">{userName} is typing</span>
        <div className="flex gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}