'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'romantic' | 'outline' | 'ghost'
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
    sm: 'px-4 py-2 text-sm font-medium',
    md: 'px-6 py-3 text-base font-medium',
    lg: 'px-8 py-4 text-lg font-semibold',
    xl: 'px-10 py-5 text-xl font-bold'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl border-0',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl',
    romantic: 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl border-0',
    outline: 'border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 backdrop-blur-sm',
    ghost: 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Shimmer effect for primary and romantic variants */}
      {(variant === 'primary' || variant === 'romantic') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        />
      )}
    </motion.button>
  )
}