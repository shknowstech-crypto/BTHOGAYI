'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CompatibilityMeterProps {
  score: number // 0-1
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
  
  const sizes = {
    sm: { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-sm' },
    md: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-base' },
    lg: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-xl' }
  }
  
  const { width, height, strokeWidth, fontSize } = sizes[size]
  const radius = (width - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score * circumference)

  const getColor = (score: number) => {
    if (score >= 0.8) return '#10b981' // green
    if (score >= 0.6) return '#f59e0b' // yellow
    if (score >= 0.4) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={height}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
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
      
      {showPercentage && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-white",
            fontSize
          )}
        >
          {percentage}%
        </motion.div>
      )}
    </div>
  )
}