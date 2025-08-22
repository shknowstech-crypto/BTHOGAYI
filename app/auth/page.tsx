'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Heart, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function AuthPage() {
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle URL error parameters
    const urlError = searchParams.get('error')
    if (urlError === 'invalid-email') {
      setError('Please use your BITS email address to sign in')
    } else if (urlError === 'auth-failed') {
      setError('Authentication failed. Please try again.')
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to BITSPARK
            </h1>
            <p className="text-white/70">
              Connect with BITS students across all campuses
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google Auth Button */}
          <GoogleAuthButton onError={setError} />

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 space-y-3"
          >
            <h3 className="text-white font-medium text-sm mb-3">Requirements:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>BITS email address required</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>All BITS campuses supported</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Safe & verified community</span>
              </div>
            </div>
          </motion.div>

          {/* Campus Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 p-4 bg-white/5 rounded-xl"
          >
            <h4 className="text-white/80 font-medium text-sm mb-2">Supported Campuses:</h4>
            <div className="grid grid-cols-2 gap-2 text-white/60 text-xs">
              <div>• BITS Pilani</div>
              <div>• BITS Goa</div>
              <div>• BITS Hyderabad</div>
              <div>• BITS Dubai</div>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}