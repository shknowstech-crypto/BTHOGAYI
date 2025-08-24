'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSupabaseClient } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth?error=auth-failed')
          return
        }

        if (session?.user) {
          // Validate BITS email
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await supabase.auth.signOut()
            navigate('/auth?error=invalid-email')
            return
          }

          // Get or create user profile
          let profile = await AuthService.getUserProfile(session.user.id)
          
          if (!profile) {
            profile = await AuthService.createUserProfile(session.user)
          }

          setUser(profile)

          // Check if profile is complete
          if (!AuthService.isProfileComplete(profile)) {
            navigate('/onboarding')
          } else {
            navigate('/dashboard')
          }
        } else {
          navigate('/auth')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth?error=auth-failed')
      }
    }

    handleAuthCallback()
  }, [navigate, setUser, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white/70">Completing sign in...</p>
      </div>
    </div>
  )
}