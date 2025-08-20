'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { CheckCircle, Circle, Camera, User, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileCompletionProps {
  completionPercentage: number
  missingFields: string[]
  isComplete: boolean
}

const fieldLabels: Record<string, { label: string; icon: any; description: string }> = {
  display_name: { label: 'Display Name', icon: User, description: 'Add your name' },
  bio: { label: 'Bio', icon: Heart, description: 'Tell others about yourself' },
  interests: { label: 'Interests', icon: Heart, description: 'Add your interests' },
  profile_photo: { label: 'Profile Photo', icon: Camera, description: 'Upload your photo' },
  year: { label: 'Academic Year', icon: User, description: 'Set your year' },
  branch: { label: 'Branch', icon: User, description: 'Set your branch' }
}

export function ProfileCompletion({ 
  completionPercentage, 
  missingFields, 
  isComplete 
}: ProfileCompletionProps) {
  const router = useRouter()

  if (isComplete) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Complete Your Profile
            </h3>
            <p className="text-white/70 text-sm">
              {completionPercentage}% complete • Get better matches with a complete profile
            </p>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="#8b5cf6"
                strokeWidth="4"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={175.93}
                initial={{ strokeDashoffset: 175.93 }}
                animate={{ strokeDashoffset: 175.93 - (completionPercentage / 100) * 175.93 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Missing Fields */}
        <div className="space-y-3 mb-6">
          {missingFields.slice(0, 3).map((field) => {
            const fieldInfo = fieldLabels[field]
            if (!fieldInfo) return null
            
            const Icon = fieldInfo.icon
            
            return (
              <div key={field} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Circle className="w-4 h-4 text-white/50" />
                <Icon className="w-4 h-4 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{fieldInfo.label}</p>
                  <p className="text-white/60 text-xs">{fieldInfo.description}</p>
                </div>
              </div>
            )
          })}
          
          {missingFields.length > 3 && (
            <p className="text-white/60 text-sm text-center">
              +{missingFields.length - 3} more fields to complete
            </p>
          )}
        </div>

        <GradientButton
          variant="romantic"
          className="w-full"
          onClick={() => router.push('/settings')}
        >
          Complete Profile
        </GradientButton>
      </GlassCard>
    </motion.div>
  )
}