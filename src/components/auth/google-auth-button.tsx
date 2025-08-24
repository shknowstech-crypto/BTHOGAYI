'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AuthService } from '@/lib/auth'
import { GradientButton } from '@/components/ui/gradient-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Shield, Sparkles } from 'lucide-react'

interface GoogleAuthButtonProps {
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function GoogleAuthButton({ onError, onSuccess }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await AuthService.signInWithGoogle()
      onSuccess?.('Redirecting to Google for secure authentication...')
    } catch (error: any) {
      console.error('Google sign in failed:', error)
      onError?.(error.message || 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Primary Google Auth Button */}
      <GradientButton
        size="lg"
        variant="romantic"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-2xl"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
      </GradientButton>
      
      {/* Security Info */}
      <div className="text-center space-y-2">
        <p className="text-white/60 text-sm flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          🎓 Use your BITS email to join the exclusive community
        </p>
        <div className="flex items-center justify-center gap-4 text-white/50 text-xs">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>JWT Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>OAuth 2.0</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>BITS Verified</span>
          </div>
        </div>
      </div>

      {/* Authentication Flow Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 p-4 bg-white/5 rounded-xl"
      >
        <h4 className="text-white/80 font-medium text-sm mb-2 text-center">
          🔐 Secure Authentication Flow:
        </h4>
        <div className="space-y-1 text-white/60 text-xs">
          <div className="flex items-center justify-between">
            <span>1. Google OAuth</span>
            <span className="text-green-400">✓ Secure</span>
          </div>
          <div className="flex items-center justify-between">
            <span>2. BITS Email Check</span>
            <span className="text-blue-400">✓ Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span>3. JWT Token</span>
            <span className="text-purple-400">✓ Generated</span>
          </div>
          <div className="flex items-center justify-between">
            <span>4. Database Sync</span>
            <span className="text-pink-400">✓ Synced</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}