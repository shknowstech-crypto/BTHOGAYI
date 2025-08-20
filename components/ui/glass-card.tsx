'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      className={cn(
        'relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl',
        'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50',
        hover && 'hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer',
        onClick && 'text-left w-full',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  )
}