'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'subtle' | 'strong' | 'romantic' | 'modern'
}

export function GlassCard({ 
  children, 
  className, 
  hover = false, 
  onClick,
  variant = 'default'
}: GlassCardProps) {
  const Component = onClick ? motion.div : 'div'
  
  const variantClasses = {
    default: 'glass-card',
    subtle: 'backdrop-blur-lg bg-white/5 border border-white/10',
    strong: 'glass-card-strong',
    romantic: 'backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 shadow-romantic',
    modern: 'backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-modern'
  }

  return (
    <Component
      className={cn(
        'rounded-2xl transition-all duration-300',
        variantClasses[variant],
        hover && 'hover:bg-white/15 hover:border-white/30 hover:shadow-glow cursor-pointer hover:-translate-y-1',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  )
}