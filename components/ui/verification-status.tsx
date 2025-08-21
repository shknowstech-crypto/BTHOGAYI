'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Mail, Camera, GraduationCap } from 'lucide-react'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { UserProfile } from '@/lib/supabase'

interface VerificationStatusProps {
  user: UserProfile
  onVerifyEmail?: () => void
  onVerifyPhoto?: () => void
  onVerifyStudentId?: () => void
}

export function VerificationStatus({
  user,
  onVerifyEmail,
  onVerifyPhoto,
  onVerifyStudentId
}: VerificationStatusProps) {
  const verificationItems = [
    {
      key: 'email',
      label: 'BITS Email',
      icon: Mail,
      verified: user.email_verified,
      action: onVerifyEmail,
      description: 'Verify your BITS email address'
    },
    {
      key: 'photo',
      label: 'Profile Photo',
      icon: Camera,
      verified: user.photo_verified,
      action: onVerifyPhoto,
      description: 'Upload and verify your profile photo'
    },
    {
      key: 'student_id',
      label: 'Student ID',
      icon: GraduationCap,
      verified: user.student_id_verified,
      action: onVerifyStudentId,
      description: 'Upload your student ID for verification'
    }
  ]

  const verifiedCount = verificationItems.filter(item => item.verified).length
  const totalCount = verificationItems.length
  const completionPercentage = (verifiedCount / totalCount) * 100

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Account Verification
          </h3>
          <p className="text-white/70 text-sm">
            {verifiedCount}/{totalCount} verified • {Math.round(completionPercentage)}% complete
          </p>
        </div>
        
        {user.verified && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">Verified</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Verification Items */}
      <div className="space-y-4">
        {verificationItems.map((item) => {
          const Icon = item.icon
          
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.verified 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {item.label}
                  </h4>
                  <p className="text-white/60 text-xs">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.verified ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Pending</span>
                    </div>
                    {item.action && (
                      <GradientButton
                        size="sm"
                        variant="secondary"
                        onClick={item.action}
                      >
                        Verify
                      </GradientButton>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {!user.verified && (
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-300 text-sm mb-1">
                Complete Verification
              </h4>
              <p className="text-blue-200 text-xs">
                Verified profiles get 3x more matches and access to premium features.
              </p>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  )
}