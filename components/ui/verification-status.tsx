'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { CheckCircle, Clock, AlertCircle, Mail, Camera, GraduationCap } from 'lucide-react'
import { UserProfile } from '@/lib/supabase'

interface VerificationStatusProps {
  user: UserProfile
  onVerifyEmail: () => void
  onVerifyPhoto: () => void
  onVerifyStudentId: () => void
}

export function VerificationStatus({ 
  user, 
  onVerifyEmail, 
  onVerifyPhoto, 
  onVerifyStudentId 
}: VerificationStatusProps) {
  const verificationItems = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your BITS email address',
      icon: Mail,
      status: user.email_verified,
      action: onVerifyEmail,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Upload and verify your profile photo',
      icon: Camera,
      status: user.photo_verified,
      action: onVerifyPhoto,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'student_id',
      title: 'Student ID',
      description: 'Verify your student ID card',
      icon: GraduationCap,
      status: user.student_id_verified,
      action: onVerifyStudentId,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const getStatusIcon = (status: boolean) => {
    if (status) return CheckCircle
    return Clock
  }

  const getStatusColor = (status: boolean) => {
    if (status) return 'text-green-400'
    return 'text-yellow-400'
  }

  const getStatusText = (status: boolean) => {
    if (status) return 'Verified'
    return 'Pending'
  }

  const completedCount = verificationItems.filter(item => item.status).length
  const totalCount = verificationItems.length
  const completionPercentage = (completedCount / totalCount) * 100

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Account Verification</h3>
          <p className="text-white/70 text-sm">
            Complete verification to unlock all features
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {completedCount}/{totalCount}
          </div>
          <div className="text-white/60 text-sm">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm">Progress</span>
          <span className="text-white/80 text-sm">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Verification Items */}
      <div className="space-y-4">
        {verificationItems.map((item, index) => {
          const StatusIcon = getStatusIcon(item.status)
          const statusColor = getStatusColor(item.status)
          const statusText = getStatusText(item.status)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
                
                {!item.status && (
                  <GradientButton
                    size="sm"
                    onClick={item.action}
                  >
                    Verify
                  </GradientButton>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Overall Status */}
      {user.verified ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center"
        >
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-bold text-green-400 mb-1">Fully Verified!</h4>
          <p className="text-green-300 text-sm">
            Your account is fully verified and ready to use all features.
          </p>
        </motion.div>
      ) : (
        <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
          <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h4 className="font-bold text-yellow-400 mb-1">Verification Pending</h4>
          <p className="text-yellow-300 text-sm">
            Complete all verification steps to unlock premium features.
          </p>
        </div>
      )}
    </GlassCard>
  )
}