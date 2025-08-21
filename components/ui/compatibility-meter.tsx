'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CompatibilityMeterProps {
  score: number // 0 to 1
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  className?: string
}

export function CompatibilityMeter({ 
  score, 
  size = 'md', 
  showPercentage = true,
  className 
}: CompatibilityMeterProps) {
  const percentage = Math.round(score * 100)
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  }

  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 6
  const radius = size === 'sm' ? 18 : size === 'md' ? 24 : 36
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score * circumference)

  const getColor = (score: number) => {
    if (score >= 0.8) return '#10B981' // Green
    if (score >= 0.6) return '#F59E0B' // Yellow
    if (score >= 0.4) return '#F97316' // Orange
    return '#EF4444' // Red
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <motion.div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-white",
            textSizes[size]
          )}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {percentage}%
        </motion.div>
      )}
    </div>
  )
}