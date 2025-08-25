/*
  # Enable Real-time Features and Storage for BITSPARK
  
  1. Enable Realtime
    - Messages table for live chat
    - Connections for instant match notifications
    - Notifications for real-time alerts
  
  2. Storage Setup
    - Profile photos bucket
    - Verification documents bucket
    - Message attachments bucket
  
  3. Real-time Policies
    - Secure real-time subscriptions
    - User-specific channels
*/

-- ========================================
-- 1. ENABLE REALTIME ON TABLES
-- ========================================

-- Enable realtime for messages (live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for connections (instant match notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE connections;

-- Enable realtime for notifications (real-time alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime for ships (instant ship notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE ships;

-- Enable realtime for daily_matches (instant daily match alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE daily_matches;

-- ========================================
-- 2. CREATE STORAGE BUCKETS
-- ========================================

-- Create profile photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create verification documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-docs',
  'verification-docs',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create message attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg']
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. STORAGE POLICIES
-- ========================================

-- Profile photos policies
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verification documents policies (private)
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Message attachments policies
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view message attachments in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN connections c ON m.connection_id = c.id
    WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    AND name LIKE '%' || m.id::text || '%'
  )
);

-- ========================================
-- 4. REAL-TIME FUNCTIONS
-- ========================================

-- Function to notify users of new matches
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for both users when connection is accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES 
    (NEW.user1_id, 'match', 'New Match!', 'You have a new connection!', 
     jsonb_build_object('connection_id', NEW.id, 'other_user_id', NEW.user2_id)),
    (NEW.user2_id, 'match', 'New Match!', 'You have a new connection!', 
     jsonb_build_object('connection_id', NEW.id, 'other_user_id', NEW.user1_id));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match notifications
DROP TRIGGER IF EXISTS trigger_notify_new_match ON connections;
CREATE TRIGGER trigger_notify_new_match
  AFTER UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();

-- Function to notify users of new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for receiver
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id, 
    'message', 
    'New Message', 
    'You have a new message!',
    jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id, 'connection_id', NEW.connection_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Function to notify users of new ships
CREATE OR REPLACE FUNCTION notify_new_ship()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for both users being shipped
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES 
  (NEW.user1_id, 'ship', 'Someone shipped you!', 
   CASE WHEN NEW.is_anonymous THEN 'Someone thinks you and another user would be perfect together!'
        ELSE (SELECT display_name FROM users WHERE id = NEW.shipper_id) || ' thinks you and another user would be perfect together!'
   END,
   jsonb_build_object('ship_id', NEW.id, 'shipper_id', NEW.shipper_id, 'is_anonymous', NEW.is_anonymous)),
  (NEW.user2_id, 'ship', 'Someone shipped you!', 
   CASE WHEN NEW.is_anonymous THEN 'Someone thinks you and another user would be perfect together!'
        ELSE (SELECT display_name FROM users WHERE id = NEW.shipper_id) || ' thinks you and another user would be perfect together!'
   END,
   jsonb_build_object('ship_id', NEW.id, 'shipper_id', NEW.shipper_id, 'is_anonymous', NEW.is_anonymous));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ship notifications
DROP TRIGGER IF EXISTS trigger_notify_new_ship ON ships;
CREATE TRIGGER trigger_notify_new_ship
  AFTER INSERT ON ships
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_ship();

-- ========================================
-- 5. MESSAGE LIMIT ENFORCEMENT
-- ========================================

-- Function to enforce 5-message limit
CREATE OR REPLACE FUNCTION enforce_message_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count integer;
BEGIN
  -- Count existing messages for this connection
  SELECT COUNT(*) INTO message_count
  FROM messages
  WHERE connection_id = NEW.connection_id;
  
  -- Check if limit exceeded
  IF message_count >= 5 THEN
    RAISE EXCEPTION 'Message limit of 5 reached for this connection. Please continue on external platforms.';
  END IF;
  
  -- Set message count
  NEW.message_count = message_count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message limit
DROP TRIGGER IF EXISTS trigger_enforce_message_limit ON messages;
CREATE TRIGGER trigger_enforce_message_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_message_limit();

-- ========================================
-- 6. ONLINE STATUS TRACKING
-- ========================================

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_seen when user performs any action
  UPDATE users 
  SET last_seen = now() 
  WHERE id = auth.uid();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity tracking
CREATE TRIGGER trigger_update_activity_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_on_connection
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Real-time Features Enabled Successfully!';
  RAISE NOTICE '💬 Live messaging with 5-message limit';
  RAISE NOTICE '🔔 Real-time notifications';
  RAISE NOTICE '📸 Photo storage buckets created';
  RAISE NOTICE '⚡ Activity tracking enabled';
  RAISE NOTICE '🎯 Ready for real-time BITSPARK experience!';
END $$;