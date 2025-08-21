'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'romantic' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

const variants = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
  secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30',
  romantic: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
  success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
  danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl'
}

export function GradientButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button'
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative font-semibold text-white rounded-xl transition-all duration-300',
        'shadow-lg hover:shadow-xl active:scale-95',
        'flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}