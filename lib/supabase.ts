import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbxdhezjxsysfigqutut.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieGRoZXpqeHN5c2ZpZ3F1dHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUzMTQsImV4cCI6MjA3MTIxMTMxNH0.C2tRbgSI6blgA10O-T-77_l0JV2FPgsMLtp_cWXE7Xk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface UserProfile {
  id: string
  bits_email: string
  student_id: string
  display_name: string
  username: string
  profile_photo?: string
  bio?: string
  interests: string[]
  year: number
  branch: string
  campus: 'Pilani' | 'Goa' | 'Hyderabad' | 'Dubai'
  preferences: {
    connect_similarity: 1 | -1 // +1 for similar, -1 for opposites
    dating_similarity: 1 | -1
    gender_preference?: 'male' | 'female' | 'any'
    age_range: [number, number]
  }
  verified: boolean
  is_active: boolean
  created_at: string
}

export interface Connection {
  id: string
  user1_id: string
  user2_id: string
  connection_type: 'friend' | 'date'
  status: 'pending' | 'accepted' | 'declined'
  compatibility_score: number
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_count: number // Track 1-5 messages
  is_read: boolean
  created_at: string
}

export interface Ship {
  id: string
  shipper_id: string
  user1_id: string
  user2_id: string
  is_anonymous: boolean
  message: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export interface DailyMatch {
  id: string
  user_id: string
  matched_user_id: string
  match_date: string
  viewed: boolean
  action: 'pass' | 'connect' | null
  created_at: string
}