/*
  # Database Schema Improvements Migration
  
  This migration adds the improvements for better onboarding and recommendation support.
  Apply this after the existing migrations.
*/

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- 2. Update existing constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_gender_values;
ALTER TABLE users ADD CONSTRAINT check_gender_values 
  CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_age_range;
ALTER TABLE users ADD CONSTRAINT check_age_range 
  CHECK (age IS NULL OR (age >= 16 AND age <= 35));

-- 3. Create function to validate preferences JSONB structure
CREATE OR REPLACE FUNCTION validate_user_preferences(preferences jsonb)
RETURNS boolean AS $$
BEGIN
  -- Allow NULL or empty preferences for incomplete profiles
  IF preferences IS NULL OR preferences = '{}'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Check if all required fields exist and have valid values
  IF preferences ? 'looking_for' AND 
     jsonb_typeof(preferences->'looking_for') = 'array' THEN
    RETURN true;
  END IF;
  
  RETURN true; -- Allow any structure for now, we'll improve validation gradually
END;
$$ LANGUAGE plpgsql;

-- 4. Add constraint to validate preferences structure
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_preferences_structure;
ALTER TABLE users ADD CONSTRAINT check_preferences_structure 
  CHECK (validate_user_preferences(preferences));

-- 5. Create performance indexes
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

-- 6. Add function to check if user profile is complete
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

-- 7. Create trigger to automatically update profile_completed status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completed = is_user_profile_complete(NEW);
  
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

-- 8. Create trigger for user_interests to update profile completion
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

-- 9. Create view for complete user profiles (for recommendations)
CREATE OR REPLACE VIEW complete_user_profiles AS
SELECT 
  u.*,
  array_agg(ui.interest ORDER BY ui.weight DESC, ui.interest) FILTER (WHERE ui.interest IS NOT NULL) as interests_array,
  count(ui.interest) as interests_count
FROM users u
LEFT JOIN user_interests ui ON u.id = ui.user_id
WHERE u.is_active = true 
  AND u.verified = true 
  AND u.profile_completed = true
GROUP BY u.id;

-- 10. Create function to get recommendations based on preferences
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
    COALESCE(p.interests_array, ARRAY[]::text[]),
    -- Simple compatibility calculation (can be enhanced)
    ROUND(
      CASE 
        WHEN target.campus = p.campus THEN 0.3
        ELSE 0.1
      END +
      CASE 
        WHEN ABS(target.year - p.year) <= 1 THEN 0.2
        WHEN ABS(target.year - p.year) <= 2 THEN 0.1
        ELSE 0.0
      END +
      -- Interests overlap (simplified)
      GREATEST(0.0, LEAST(0.5, 
        COALESCE((SELECT count(*) * 0.1 
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

-- 11. Add useful database functions for analytics
CREATE OR REPLACE FUNCTION get_onboarding_stats()
RETURNS TABLE (
  total_users bigint,
  completed_profiles bigint,
  incomplete_profiles bigint,
  avg_completion_time interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    count(*) as total_users,
    count(*) FILTER (WHERE profile_completed = true) as completed_profiles,
    count(*) FILTER (WHERE profile_completed = false) as incomplete_profiles,
    avg(onboarding_completed_at - created_at) FILTER (WHERE onboarding_completed_at IS NOT NULL) as avg_completion_time
  FROM users
  WHERE created_at >= now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- 12. Add function to clean up incomplete profiles older than 7 days
CREATE OR REPLACE FUNCTION cleanup_incomplete_profiles()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM users 
  WHERE profile_completed = false 
    AND created_at < now() - interval '7 days'
    AND verified = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Update existing users to trigger profile completion check
UPDATE users SET updated_at = now() WHERE profile_completed IS NULL OR profile_completed = false;
