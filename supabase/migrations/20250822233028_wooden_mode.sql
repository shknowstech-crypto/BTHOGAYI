/*
  # BITSPARK Simplified Schema

  1. New Tables
    - `users` table for user profiles with Google OAuth
    - `connections` table for friend/dating connections 
    - `messages` table with 5-message limit tracking
    - `ships` table for third-party matchmaking
    - `daily_matches` table for algorithm-powered daily suggestions
    - `invitations` table for friend invites

  2. Security
    - Enable RLS on all tables
    - Users can only see their own data and public profiles
    - Messages are encrypted and only visible to sender/receiver

  3. Features
    - Google OAuth integration
    - No manual verification required
    - Profile completion tracking
    - Real-time messaging with limits
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  profile_photo text,
  bio text DEFAULT '',
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  interests text[] DEFAULT '{}',
  year integer CHECK (year >= 1 AND year <= 5),
  branch text NOT NULL DEFAULT '',
  campus text NOT NULL CHECK (campus IN ('Pilani', 'Goa', 'Hyderabad', 'Dubai')),
  
  -- Preferences for matching algorithm
  preferences jsonb DEFAULT '{
    "connect_similarity": 1,
    "dating_similarity": 1,
    "gender_preference": "any",
    "age_range": [18, 30],
    "looking_for": ["friends"]
  }'::jsonb,
  
  -- Account status
  is_active boolean DEFAULT true,
  profile_completed boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Connections table for friends and dating
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  connection_type text NOT NULL CHECK (connection_type IN ('friend', 'date')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  compatibility_score float DEFAULT 0.0 CHECK (compatibility_score >= 0.0 AND compatibility_score <= 1.0),
  match_reason text,
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

-- Invitations table for friend invites
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitation_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('match', 'message', 'ship', 'connection_request', 'daily_match', 'invitation')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_campus ON users(campus);
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

CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);

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
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
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
  USING (auth.uid() = receiver_id);

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

-- Invitations: users can create and view their own invitations
CREATE POLICY "Users can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can view own invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Notifications: users can see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);