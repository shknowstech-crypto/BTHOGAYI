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
    
    const profileData = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email.split('@')[0],
      bio: '',
      age: null,
      gender: null,
      year: 1,
      branch: '',
      campus: campus,
      student_id: '',
      verified: false,
      profile_completed: false,
      onboarding_step: 0,
      preferences: {
        age_range: [18, 25],
        same_campus_only: false,
        same_year_preference: false,
        distance_km: 50
      },
      privacy_settings: {
        show_age: true,
        show_year: true,
        show_branch: true,
        discoverable: true,
        show_last_active: false,
        campus_visibility: "all_campuses"
      },
      last_active: new Date().toISOString(),
      is_active: true,
      subscription_tier: 'free',
      daily_swipes_remaining: 50,
      super_swipes_remaining: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating user profile:', { userId: user.id, profileData })

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create user profile:', error)
      throw new Error(`Failed to create profile: ${error.message} (Code: ${error.code})`)
    }

    console.log('User profile created successfully:', data)
    return data
  }

  // Update user profile directly via Supabase (optimal for free tier)
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
    // Ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Not authenticated - please log in again')
    }

    // Ensure the user ID matches the authenticated user
    if (session.user.id !== userId) {
      throw new Error('User ID mismatch - security violation')
    }

    // Prepare updates with timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating user profile:', { userId, updates: updatesWithTimestamp })

    // Use UPSERT to handle cases where user doesn't exist yet
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { id: userId, ...updatesWithTimestamp },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    if (!data) {
      throw new Error('No data returned from upsert operation')
    }

    console.log('Profile updated successfully:', data)
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
      user.preferences
    )
  }

  // Generate unique username
  private static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }
}