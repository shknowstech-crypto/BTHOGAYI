'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.div : motion.div

  return (
    <Component
      className={cn(
        'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl',
        hover && 'hover:bg-white/15 transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </Component>
  )
}