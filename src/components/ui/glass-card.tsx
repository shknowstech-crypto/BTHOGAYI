'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'subtle' | 'strong'
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
    default: 'backdrop-blur-xl bg-white/10 border border-white/20',
    subtle: 'backdrop-blur-lg bg-white/5 border border-white/10',
    strong: 'backdrop-blur-2xl bg-white/15 border border-white/30'
  }

  return (
    <Component
      className={cn(
        'rounded-2xl shadow-2xl transition-all duration-300',
        variantClasses[variant],
        hover && 'hover:bg-white/15 hover:border-white/30 hover:shadow-3xl cursor-pointer',
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