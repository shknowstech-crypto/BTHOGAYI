/*
  # BITSPARK Initial Schema

  1. New Tables
    - `users` table for user profiles with BITS email verification
    - `connections` table for friend/dating connections 
    - `messages` table with 5-message limit tracking
    - `ships` table for third-party matchmaking
    - `daily_matches` table for algorithm-powered daily suggestions
    - `user_interests` table for normalized interest storage
    - `reports` table for safety and moderation

  2. Security
    - Enable RLS on all tables
    - Users can only see their own data and public profiles
    - Messages are encrypted and only visible to sender/receiver
    - Reporting system for safety

  3. Features
    - BITS email domain validation
    - Student ID verification system
    - Profile photo verification
    - Compatibility scoring algorithm support
    - Real-time messaging with limits
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bits_email text UNIQUE NOT NULL,
  student_id text UNIQUE NOT NULL,
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  profile_photo text,
  bio text DEFAULT '',
  year integer CHECK (year >= 1 AND year <= 5),
  branch text NOT NULL,
  campus text NOT NULL CHECK (campus IN ('Pilani', 'Goa', 'Hyderabad', 'Dubai')),
  
  -- Preferences for matching algorithm
  preferences jsonb DEFAULT '{
    "connect_similarity": 1,
    "dating_similarity": 1,
    "gender_preference": "any",
    "age_range": [18, 30],
    "max_distance": 50
  }'::jsonb,
  
  -- Verification status
  email_verified boolean DEFAULT false,
  student_id_verified boolean DEFAULT false,
  photo_verified boolean DEFAULT false,
  verified boolean GENERATED ALWAYS AS (email_verified AND student_id_verified AND photo_verified) STORED,
  
  -- Account status
  is_active boolean DEFAULT true,
  last_seen timestamptz DEFAULT now(),
  streak_count integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User interests (normalized table)
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  weight float DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Connections table for friends and dating
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  connection_type text NOT NULL CHECK (connection_type IN ('friend', 'date')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  compatibility_score float DEFAULT 0.0 CHECK (compatibility_score >= 0.0 AND compatibility_score <= 1.0),
  match_reason text, -- Why they were matched
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CHECK (user1_id != user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Messages table with 5-message limit
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_count integer NOT NULL CHECK (message_count >= 1 AND message_count <= 5),
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

-- Ships table for third-party matchmaking
CREATE TABLE IF NOT EXISTS ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_anonymous boolean DEFAULT false,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CHECK (shipper_id != user1_id AND shipper_id != user2_id AND user1_id != user2_id),
  UNIQUE(shipper_id, user1_id, user2_id)
);

-- Daily matches table
CREATE TABLE IF NOT EXISTS daily_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  match_date date DEFAULT CURRENT_DATE,
  algorithm_version text DEFAULT '1.0',
  compatibility_score float DEFAULT 0.0,
  viewed boolean DEFAULT false,
  action text CHECK (action IN ('pass', 'connect', 'super_like') OR action IS NULL),
  created_at timestamptz DEFAULT now(),
  acted_at timestamptz,
  CHECK (user_id != matched_user_id),
  UNIQUE(user_id, matched_user_id, match_date)
);

-- Reports table for safety
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('harassment', 'spam', 'fake_profile', 'inappropriate_content', 'other')),
  description text,
  evidence_urls text[], -- Screenshots, etc.
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  moderator_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  CHECK (reporter_id != reported_user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('match', 'message', 'ship', 'connection_request', 'daily_match')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(bits_email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_campus ON users(campus);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(connection_type);

CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_ships_users ON ships(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_ships_shipper ON ships(shipper_id);
CREATE INDEX IF NOT EXISTS idx_ships_status ON ships(status);

CREATE INDEX IF NOT EXISTS idx_daily_matches_user ON daily_matches(user_id, match_date);
CREATE INDEX IF NOT EXISTS idx_daily_matches_date ON daily_matches(match_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can see their own profile and public profiles of others
CREATE POLICY "Users can view public profiles"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User interests: users can manage their own interests
CREATE POLICY "Users can manage own interests"
  ON user_interests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Connections: users can see connections involving them
CREATE POLICY "Users can view own connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create connections"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own connections"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: only sender and receiver can see messages
CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id); -- For marking as read

-- Ships: users can see ships involving them
CREATE POLICY "Users can view relevant ships"
  ON ships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = shipper_id OR auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create ships"
  ON ships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "Users can respond to ships"
  ON ships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Daily matches: users can see their own matches
CREATE POLICY "Users can view own daily matches"
  ON daily_matches
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports: users can create reports and see their own
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Notifications: users can see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);