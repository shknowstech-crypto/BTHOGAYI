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
    return 'Pilani'
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, profileData: Partial<UserProfile>) {
    const supabase = createSupabaseClient()
    
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your BITS email address')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: profileData.display_name,
          campus: this.getCampusFromEmail(email)
        }
      }
    })

    if (error) throw error
    return data
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Sign in with Google OAuth
  static async signInWithGoogle() {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

  // Get current session
  static async getSession() {
    const supabase = createSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
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

  // Create user profile
  static async createUserProfile(user: any, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
    if (!this.validateBitsEmail(user.email)) {
      throw new Error('Please use your BITS email address')
    }
    
    const campus = this.getCampusFromEmail(user.email)
    const username = this.generateUsername(user.user_metadata?.full_name || user.email.split('@')[0])
    
    const profileData = {
      id: user.id,
      bits_email: user.email,
      student_id: additionalData?.student_id || '',
      display_name: user.user_metadata?.full_name || additionalData?.display_name || user.email.split('@')[0],
      username: username,
      profile_photo: user.user_metadata?.avatar_url,
      bio: additionalData?.bio || '',
      age: additionalData?.age,
      gender: additionalData?.gender,
      year: additionalData?.year || 1,
      branch: additionalData?.branch || 'Computer Science',
      campus: campus,
      preferences: {
        age_range: [18, 30],
        max_distance: 50,
        dating_similarity: 1,
        gender_preference: 'any',
        connect_similarity: 1,
        looking_for: ['friends']
      },
      email_verified: user.email_confirmed_at ? true : false,
      student_id_verified: false,
      photo_verified: false,
      is_active: true,
      profile_completed: false,
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

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
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