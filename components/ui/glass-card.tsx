'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: 'sm' | 'md' | 'lg'
  gradient?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  blur = 'md',
  border = true,
  shadow = 'lg',
  gradient = false
}: GlassCardProps) {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  const shadowMap = {
    sm: 'shadow-lg',
    md: 'shadow-xl',
    lg: 'shadow-2xl'
  }

  return (
    <motion.div
      className={cn(
        // Base glass effect
        'bg-white/10 backdrop-blur-md',
        blurMap[blur],
        
        // Border
        border && 'border border-white/20',
        
        // Shadow
        shadowMap[shadow],
        
        // Rounded corners
        'rounded-3xl',
        
        // Gradient overlay
        gradient && 'bg-gradient-to-br from-white/15 to-white/5',
        
        className
      )}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        boxShadow: '0 25px 50px rgba(31, 38, 135, 0.4)'
      } : undefined}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {children}
    </motion.div>
  )
}