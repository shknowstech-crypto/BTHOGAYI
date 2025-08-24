/*
  Complete Database Schema for BTHOGAYI
  This creates all necessary tables and optimizations for the dating/networking app
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Create users table (if not exists, otherwise add missing columns)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            email text UNIQUE NOT NULL,
            display_name text,
            bio text,
            age integer,
            gender text,
            year integer,
            branch text,
            campus text,
            preferences jsonb DEFAULT '{}'::jsonb,
            profile_completed boolean DEFAULT false,
            is_active boolean DEFAULT true,
            verified boolean DEFAULT false,
            onboarding_completed_at timestamptz,
            onboarding_step integer DEFAULT 0,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    ELSE
        -- Add missing columns if they don't exist
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Create user_interests table (if not exists)
CREATE TABLE IF NOT EXISTS user_interests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    interest text NOT NULL,
    weight decimal DEFAULT 1.0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, interest)
);

-- 3. Create connections table (MISSING - this was causing the error)
CREATE TABLE IF NOT EXISTS connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
    user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id)
);

-- 4. Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 5. Create reports table for user safety
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz
);

-- 6. Create user_photos table for profile photos
CREATE TABLE IF NOT EXISTS user_photos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    photo_url text NOT NULL,
    is_primary boolean DEFAULT false,
    upload_order integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 7. Create recommendations_feedback table
CREATE TABLE IF NOT EXISTS recommendations_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    action text CHECK (action IN ('like', 'pass', 'super_like')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, recommended_user_id)
);

-- 8. Add constraints and checks
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_gender_values;
ALTER TABLE users ADD CONSTRAINT check_gender_values 
  CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_age_range;
ALTER TABLE users ADD CONSTRAINT check_age_range 
  CHECK (age IS NULL OR (age >= 16 AND age <= 35));

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_year_range;
ALTER TABLE users ADD CONSTRAINT check_year_range 
  CHECK (year IS NULL OR (year >= 1 AND year <= 4));

-- 9. Create function to validate preferences JSONB structure
CREATE OR REPLACE FUNCTION validate_user_preferences(preferences jsonb)
RETURNS boolean AS $$
BEGIN
  -- Allow NULL or empty preferences for incomplete profiles
  IF preferences IS NULL OR preferences = '{}'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Check if looking_for exists and is an array
  IF preferences ? 'looking_for' AND 
     jsonb_typeof(preferences->'looking_for') = 'array' THEN
    RETURN true;
  END IF;
  
  RETURN true; -- Allow any structure for gradual improvement
END;
$$ LANGUAGE plpgsql;

-- 10. Add constraint to validate preferences structure
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_preferences_structure;
ALTER TABLE users ADD CONSTRAINT check_preferences_structure 
  CHECK (validate_user_preferences(preferences));

-- 11. Create function to check if user profile is complete
CREATE OR REPLACE FUNCTION is_user_profile_complete(user_row users)
RETURNS boolean AS $$
BEGIN
  RETURN (
    user_row.display_name IS NOT NULL AND user_row.display_name != '' AND
    user_row.bio IS NOT NULL AND user_row.bio != '' AND
    user_row.age IS NOT NULL AND
    user_row.gender IS NOT NULL AND
    user_row.year IS NOT NULL AND
    user_row.branch IS NOT NULL AND user_row.branch != '' AND
    user_row.preferences IS NOT NULL AND
    user_row.preferences ? 'looking_for' AND
    jsonb_array_length(user_row.preferences->'looking_for') > 0 AND
    EXISTS (
      SELECT 1 FROM user_interests 
      WHERE user_id = user_row.id 
      HAVING count(*) >= 3
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to automatically update profile_completed status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completed = is_user_profile_complete(NEW);
  NEW.updated_at = now();
  
  -- Set onboarding completion timestamp if just completed
  IF NEW.profile_completed = true AND (OLD.profile_completed = false OR OLD.profile_completed IS NULL) THEN
    NEW.onboarding_completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create/update trigger
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON users;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- 13. Create trigger for user_interests to update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion_on_interests()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's profile_completed status
  UPDATE users 
  SET profile_completed = is_user_profile_complete(users.*),
      updated_at = now()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for user_interests
DROP TRIGGER IF EXISTS trigger_interests_insert ON user_interests;
CREATE TRIGGER trigger_interests_insert
  AFTER INSERT ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion_on_interests();

DROP TRIGGER IF EXISTS trigger_interests_delete ON user_interests;
CREATE TRIGGER trigger_interests_delete
  AFTER DELETE ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion_on_interests();

-- 14. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_completion 
  ON users(profile_completed, onboarding_completed_at) 
  WHERE profile_completed = false;

CREATE INDEX IF NOT EXISTS idx_users_preferences_looking_for 
  ON users USING gin ((preferences->'looking_for')) 
  WHERE is_active = true AND verified = true;

CREATE INDEX IF NOT EXISTS idx_complete_profiles_campus_year 
  ON users(campus, year) 
  WHERE is_active = true AND verified = true AND profile_completed = true;

CREATE INDEX IF NOT EXISTS idx_connections_lookup 
  ON connections(user1_id, user2_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_status 
  ON connections(status, created_at);

CREATE INDEX IF NOT EXISTS idx_user_interests_lookup 
  ON user_interests(user_id, interest);

CREATE INDEX IF NOT EXISTS idx_messages_connection 
  ON messages(connection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_feedback 
  ON recommendations_feedback(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email) WHERE is_active = true;

-- 15. Create view for complete user profiles (for recommendations)
CREATE OR REPLACE VIEW complete_user_profiles AS
SELECT 
  u.*,
  array_agg(ui.interest ORDER BY ui.weight DESC, ui.interest) FILTER (WHERE ui.interest IS NOT NULL) as interests_array,
  count(ui.interest) as interests_count,
  (SELECT photo_url FROM user_photos WHERE user_id = u.id AND is_primary = true LIMIT 1) as primary_photo
FROM users u
LEFT JOIN user_interests ui ON u.id = ui.user_id
WHERE u.is_active = true 
  AND u.verified = true 
  AND u.profile_completed = true
GROUP BY u.id;

-- 16. Create optimized recommendation function
CREATE OR REPLACE FUNCTION get_user_recommendations(
  target_user_id uuid,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  bio text,
  age integer,
  year integer,
  branch text,
  campus text,
  primary_photo text,
  interests_array text[],
  compatibility_score decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.bio,
    p.age,
    p.year,
    p.branch,
    p.campus,
    p.primary_photo,
    COALESCE(p.interests_array, ARRAY[]::text[]),
    -- Enhanced compatibility calculation
    ROUND(
      -- Campus match bonus
      CASE 
        WHEN target.campus = p.campus THEN 0.3
        ELSE 0.1
      END +
      -- Year proximity bonus
      CASE 
        WHEN ABS(target.year - p.year) <= 1 THEN 0.2
        WHEN ABS(target.year - p.year) <= 2 THEN 0.1
        ELSE 0.0
      END +
      -- Age compatibility
      CASE 
        WHEN ABS(target.age - p.age) <= 2 THEN 0.1
        WHEN ABS(target.age - p.age) <= 4 THEN 0.05
        ELSE 0.0
      END +
      -- Interests overlap (enhanced)
      GREATEST(0.0, LEAST(0.4, 
        COALESCE((SELECT count(*) * 0.08 
         FROM unnest(COALESCE(target.interests_array, ARRAY[]::text[])) AS target_interest
         WHERE target_interest = ANY(COALESCE(p.interests_array, ARRAY[]::text[]))), 0)
      )),
      2
    )::decimal AS compatibility_score
  FROM complete_user_profiles p
  CROSS JOIN complete_user_profiles target
  WHERE target.id = target_user_id
    AND p.id != target_user_id
    AND NOT EXISTS (
      -- Exclude already connected users
      SELECT 1 FROM connections c 
      WHERE (c.user1_id = target_user_id AND c.user2_id = p.id)
         OR (c.user2_id = target_user_id AND c.user1_id = p.id)
    )
    AND NOT EXISTS (
      -- Exclude users who have been passed on
      SELECT 1 FROM recommendations_feedback rf
      WHERE rf.user_id = target_user_id 
        AND rf.recommended_user_id = p.id 
        AND rf.action = 'pass'
    )
    -- Check if looking_for preferences match
    AND (
      (target.preferences->'looking_for' ? 'friends' AND p.preferences->'looking_for' ? 'friends') OR
      (target.preferences->'looking_for' ? 'dating' AND p.preferences->'looking_for' ? 'dating') OR
      (target.preferences->'looking_for' ? 'networking' AND p.preferences->'looking_for' ? 'networking')
    )
  ORDER BY compatibility_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 17. Create analytics functions
CREATE OR REPLACE FUNCTION get_onboarding_stats()
RETURNS TABLE (
  total_users bigint,
  completed_profiles bigint,
  incomplete_profiles bigint,
  avg_completion_time interval,
  completion_rate decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    count(*) as total_users,
    count(*) FILTER (WHERE profile_completed = true) as completed_profiles,
    count(*) FILTER (WHERE profile_completed = false) as incomplete_profiles,
    avg(onboarding_completed_at - created_at) FILTER (WHERE onboarding_completed_at IS NOT NULL) as avg_completion_time,
    ROUND(
      count(*) FILTER (WHERE profile_completed = true)::decimal / 
      NULLIF(count(*)::decimal, 0) * 100, 
      2
    ) as completion_rate
  FROM users
  WHERE created_at >= now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- 18. Create function to get user connections count
CREATE OR REPLACE FUNCTION get_user_connections_count(target_user_id uuid)
RETURNS TABLE (
  total_connections bigint,
  pending_connections bigint,
  accepted_connections bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE status = 'pending') as pending_connections,
    count(*) FILTER (WHERE status = 'accepted') as accepted_connections
  FROM connections
  WHERE user1_id = target_user_id OR user2_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- 19. Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE (
  deleted_users integer,
  deleted_messages integer
) AS $$
DECLARE
  deleted_users_count integer;
  deleted_messages_count integer;
BEGIN
  -- Delete incomplete profiles older than 7 days
  DELETE FROM users 
  WHERE profile_completed = false 
    AND created_at < now() - interval '7 days'
    AND verified = false;
  GET DIAGNOSTICS deleted_users_count = ROW_COUNT;
  
  -- Delete old messages from declined/blocked connections
  DELETE FROM messages 
  WHERE connection_id IN (
    SELECT id FROM connections 
    WHERE status IN ('declined', 'blocked') 
      AND updated_at < now() - interval '30 days'
  );
  GET DIAGNOSTICS deleted_messages_count = ROW_COUNT;
  
  RETURN QUERY SELECT deleted_users_count, deleted_messages_count;
END;
$$ LANGUAGE plpgsql;

-- 20. Update existing users to trigger profile completion check
UPDATE users SET updated_at = now() WHERE profile_completed IS NULL OR profile_completed = false;

-- 21. Insert sample interests if table is empty (for testing)
INSERT INTO user_interests (user_id, interest, weight) 
SELECT 
  (SELECT id FROM users LIMIT 1), 
  interest, 
  1.0
FROM (VALUES 
  ('Music'), ('Sports'), ('Technology'), ('Art'), ('Travel'), 
  ('Photography'), ('Cooking'), ('Reading'), ('Gaming'), ('Fitness'),
  ('Movies'), ('Dancing'), ('Hiking'), ('Programming'), ('Design')
) AS sample_interests(interest)
WHERE EXISTS (SELECT 1 FROM users)
  AND NOT EXISTS (SELECT 1 FROM user_interests)
ON CONFLICT (user_id, interest) DO NOTHING;

-- Final message
DO $$
BEGIN
  RAISE NOTICE 'Database schema setup completed successfully!';
  RAISE NOTICE 'Tables created: users, user_interests, connections, messages, reports, user_photos, recommendations_feedback';
  RAISE NOTICE 'Functions created: recommendation engine, analytics, cleanup utilities';
  RAISE NOTICE 'Indexes created for optimal performance';
END $$;
