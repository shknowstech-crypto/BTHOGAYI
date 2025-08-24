import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a function to get a fresh client instance
export const createSupabaseClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
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
}

// Export default client instance
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
  email: string
  display_name: string
  bio?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  year?: number
  branch?: string
  campus?: string
  student_id?: string
  verified?: boolean
  profile_completed?: boolean
  preferences?: any
  privacy_settings?: any
  subscription_tier?: string
  last_active?: string
  created_at?: string
  updated_at?: string
}

export interface Connection {
  id: string
  user1_id: string
  user2_id: string
  connection_type: 'friend' | 'date'
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  compatibility_score: number
  match_reason?: string
  created_at: string
  responded_at?: string
}

export interface Message {
  id: string
  connection_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_count: number
  message_type: 'text' | 'image' | 'emoji'
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
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  responded_at?: string
}

export interface DailyMatch {
  id: string
  user_id: string
  matched_user_id: string
  match_date: string
  algorithm_version: string
  compatibility_score: number
  viewed: boolean
  action: 'pass' | 'connect' | 'super_like' | null
  created_at: string
  acted_at?: string
}

export interface UserInterest {
  id: string
  user_id: string
  interest: string
  weight: number
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  report_type: 'harassment' | 'spam' | 'fake_profile' | 'inappropriate_content' | 'other'
  description?: string
  evidence_urls?: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  moderator_notes?: string
  created_at: string
  resolved_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'match' | 'message' | 'ship' | 'connection_request' | 'daily_match'
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
}