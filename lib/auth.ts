    
    const supabase = createSupabaseClient()
      profile.bio &&
      profile.interests.length > 0 &&
      profile.year &&
      profile.branch &&
      profile.age &&
      profile.gender
    )
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

  // Create user profile after Google OAuth
  static async createUserProfile(user: any): Promise<UserProfile> {
    const supabase = createSupabaseClient()
    
    // Validate BITS email
    if (!this.validateBitsEmail(user.email)) {
      throw new Error('Please use your BITS email address to sign up')
    }

    const campus = this.getCampusFromEmail(user.email)
    const username = this.generateUsername(user.user_metadata?.full_name || user.email)

    const profileData = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || '',
      username,
      profile_photo: user.user_metadata?.avatar_url || '',
      bio: '',
      interests: [],
      year: 1,
      branch: '',
      campus,
      preferences: {
        connect_similarity: 1,
        dating_similarity: 1,
        gender_preference: 'any' as const,
        age_range: [18, 30] as [number, number],
        looking_for: ['friends'] as ('friends' | 'dating' | 'networking')[]
      },
      is_active: true,
      profile_completed: false,
      last_seen: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
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

  // Generate unique username
  private static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }

  // Check if profile is complete
  static isProfileComplete(profile: UserProfile): boolean {
    return !!(
      profile.display_name &&
      profile.bio &&
      profile.interests.length > 0 &&
      profile.year &&
      profile.branch &&
      profile.age &&
      profile.gender
    )
  }
}