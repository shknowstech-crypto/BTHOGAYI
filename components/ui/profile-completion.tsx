'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileCompletionProps {
  completionPercentage: number
  missingFields: string[]
  isComplete: boolean
}

export function ProfileCompletion({ 
  completionPercentage, 
  missingFields, 
  isComplete 
}: ProfileCompletionProps) {
  const router = useRouter()

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white font-medium">Profile Complete!</span>
            <div className="ml-auto text-green-400 font-semibold">100%</div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-white font-semibold">Complete Your Profile</h3>
              <p className="text-white/70 text-sm">
                Get better matches with a complete profile
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {completionPercentage}%
            </div>
            <div className="text-white/60 text-sm">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="mb-4">
            <p className="text-white/80 text-sm mb-2">Missing:</p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span 
                  key={field}
                  className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs"
                >
                  {field.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <GradientButton
          size="sm"
          variant="romantic"
          onClick={() => router.push('/profile')}
        >
          Complete Profile
          <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </GlassCard>
    </motion.div>
  )
}