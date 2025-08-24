'use client'

import { motion } from 'framer-motion'
import { cn } from '../../src/lib/utils'
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
  const variantClasses = {
    default: 'backdrop-blur-xl bg-white/[0.08] border border-white/[0.15] shadow-2xl',
    subtle: 'backdrop-blur-lg bg-white/[0.05] border border-white/[0.1] shadow-xl',
    strong: 'backdrop-blur-2xl bg-white/[0.12] border border-white/[0.2] shadow-3xl'
  }

  const baseClasses = cn(
    'rounded-2xl transition-all duration-300 relative overflow-hidden',
    variantClasses[variant],
    hover && 'hover:bg-white/[0.12] hover:border-white/[0.25] hover:shadow-3xl cursor-pointer hover:-translate-y-1',
    className
  )

  const motionProps = hover ? {
    whileHover: { 
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.98 }
  } : {}

  if (onClick || hover) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        {...motionProps}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-black/[0.05] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-black/[0.05] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}