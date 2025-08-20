'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'romantic' | 'connection'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

export function GradientButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button'
}: GradientButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    secondary: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    romantic: 'bg-gradient-to-r from-pink-500 to-rose-500',
    connection: 'bg-gradient-to-r from-purple-500 to-indigo-500'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        // Base styles
        'relative overflow-hidden rounded-2xl font-semibold text-white',
        'transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-purple-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Gradient background
        variants[variant],
        
        // Size
        sizes[size],
        
        className
      )}
      whileHover={!disabled && !loading ? { 
        scale: 1.05,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated background overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
    </motion.button>
  )
}