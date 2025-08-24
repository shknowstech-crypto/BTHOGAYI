'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSupabaseClient } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireCompleteProfile?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireCompleteProfile = false,
  redirectTo 
}: AuthGuardProps) {
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          logout()
          if (requireAuth) {
            navigate('/auth?error=session-error')
          }
          return
        }
        
        if (session?.user) {
          // Validate BITS email
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await AuthService.signOut()
            logout()
            navigate('/auth?error=invalid-email')
            return
          }

          // Get or create user profile
          let profile = await AuthService.getUserProfile(session.user.id)
          
          if (!profile) {
            try {
              profile = await AuthService.createUserProfile(session.user)
            } catch (createError: any) {
              console.error('Profile creation failed:', createError)
              await AuthService.signOut()
              logout()
              navigate('/auth?error=profile-creation-failed')
              return
            }
          }

          setUser(profile)

          // Check if profile completion is required
          if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
            navigate('/onboarding')
            return
          }
        } else {
          logout()
          if (requireAuth) {
            navigate(redirectTo || '/auth')
            return
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
        if (requireAuth) {
          navigate('/auth?error=auth-failed')
        }
      } finally {
        setIsChecking(false)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          logout()
          if (requireAuth) {
            navigate('/auth')
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Validate BITS email on sign in
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await AuthService.signOut()
            logout()
            navigate('/auth?error=invalid-email')
            return
          }
          
          const profile = await AuthService.getUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
            // Check if profile needs completion
            if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
              navigate('/onboarding')
            } else if (!requireCompleteProfile) {
              navigate('/dashboard')
            }
          } else {
            // Create new profile for first-time users
            try {
              const newProfile = await AuthService.createUserProfile(session.user)
              setUser(newProfile)
              navigate('/onboarding')
            } catch (error) {
              console.error('Failed to create profile:', error)
              await AuthService.signOut()
              logout()
              navigate('/auth?error=profile-creation-failed')
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [requireAuth, requireCompleteProfile, redirectTo, navigate, setUser, setLoading, logout, supabase.auth])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white/70">Loading BITSPARK...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null // Router will handle redirect
  }

  // If complete profile is required but profile is incomplete
  if (requireCompleteProfile && user && !AuthService.isProfileComplete(user)) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}