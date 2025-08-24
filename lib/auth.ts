import { createSupabaseClient } from './supabase'
import { UserProfile } from './supabase'

export class AuthService {
  // BITS email validation
  static validateBitsEmail(email: string): boolean {
    const bitsEmailRegex = /^[a-zA-Z0-9._%+-]+@(pilani\.bits-pilani\.ac\.in|goa\.bits-pilani\.ac\.in|hyderabad\.bits-pilani\.ac\.in|dubai\.bits-pilani\.ac\.in)$/
    return bitsEmailRegex.test(email)
  }

  // Extract campus from email domain
  static getCampusFromEmail(email: string): 'Pilani' | 'Goa' | 'Hyderabad' | 'Dubai' {
    if (email.includes('goa.bits-pilani.ac.in')) return 'Goa'
    if (email.includes('hyderabad.bits-pilani.ac.in')) return 'Hyderabad'
    if (email.includes('dubai.bits-pilani.ac.in')) return 'Dubai'
    return 'Pilani' // Default to Pilani for pilani.bits-pilani.ac.in
  }

  // Sign in with Google OAuth (Primary method)
  static async signInWithGoogle() {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser() {
    const supabase = createSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  // Create user profile from Google OAuth user
  static async createUserProfile(user: any): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
    // Validate BITS email
    if (!this.validateBitsEmail(user.email)) {
      throw new Error('Please use your BITS email address to sign in')
    }
    
    const campus = this.getCampusFromEmail(user.email)
    const username = this.generateUsername(user.user_metadata?.full_name || user.email.split('@')[0])
    
    const profileData = {
      id: user.id,
      email: user.email,  // Use 'email' not 'bits_email'
      student_id: '', // Will be filled during onboarding
      display_name: user.user_metadata?.full_name || user.email.split('@')[0],
      bio: '',
      age: null,
      gender: null,
      year: 1,
      branch: '',
      campus: campus,
      preferences: {
        age_range: [18, 30],
        max_distance: 50,
        dating_similarity: 1,
        gender_preference: 'any',
        connect_similarity: 1
      },
      email_verified: user.email_confirmed_at ? true : false,
      student_id_verified: false,
      photo_verified: false,
      is_active: true,
      last_seen: new Date().toISOString(),
      streak_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update user profile via backend API (safer than direct Supabase)
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }

    // Try backend API first (recommended)
    try {
      const apiUrl = import.meta.env.VITE_RECOMMENDATION_API_URL || 'https://bthogayi.onrender.com'
      const response = await fetch(`${apiUrl}/api/v1/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const result = await response.json()
        return result.user
      }
    } catch (error) {
      console.warn('Backend API failed, falling back to direct Supabase:', error)
    }

    // Fallback to direct Supabase update
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updatesWithTimestamp)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Check if profile is complete
  static isProfileComplete(user: UserProfile): boolean {
    return !!(
      user.display_name &&
      user.bio &&
      user.age &&
      user.year &&
      user.branch &&
      user.student_id &&
      user.preferences?.looking_for &&
      user.preferences.looking_for.length > 0
    )
  }

  // Generate unique username
  private static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }
}