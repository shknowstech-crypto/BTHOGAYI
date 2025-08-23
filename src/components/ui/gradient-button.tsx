'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'romantic' | 'modern' | 'fresh' | 'outline'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function GradientButton({ 
  children, 
  className, 
  size = 'md', 
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button'
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
    xl: 'px-10 py-5 text-xl font-bold'
  }

  const variantClasses = {
    primary: 'btn-romantic text-white font-medium',
    secondary: 'glass-card hover:bg-white/20 border border-white/20 hover:border-white/30 text-white backdrop-blur-sm',
    romantic: 'btn-romantic text-white font-semibold shadow-romantic',
    modern: 'btn-modern text-white font-semibold shadow-modern',
    fresh: 'bg-fresh hover:shadow-fresh text-white font-semibold transition-all duration-300 hover:-translate-y-1',
    outline: 'border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-300'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none',
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <span className="relative z-10">{children}</span>
      {(variant === 'primary' || variant === 'romantic' || variant === 'modern') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
      )}
    </motion.button>
  )
}