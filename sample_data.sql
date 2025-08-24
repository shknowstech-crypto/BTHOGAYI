-- BITSPARK Sample Data Script - Aligned with Database Schema
-- Run this script in the Supabase SQL Editor to populate your database with test data

-- Insert sample users (using correct schema)
INSERT INTO users (
    bits_email, 
    student_id, 
    display_name, 
    username, 
    bio, 
    age, 
    gender, 
    year, 
    branch, 
    campus,
    email_verified,
    student_id_verified,
    photo_verified
) VALUES 
-- Verified BITS students/alumni
('2021A7PS0001P@pilani.bits-pilani.ac.in', '2021A7PS0001P', 'Arjun Sharma', 'arjun_cs', 'CS grad passionate about AI and sports photography', 23, 'male', 4, 'Computer Science', 'Pilani', true, true, true),
('2022A3PS0002G@goa.bits-pilani.ac.in', '2022A3PS0002G', 'Priya Patel', 'priya_ece', 'Electronics engineer turned data scientist, love exploring new places', 22, 'female', 3, 'Electronics & Communication', 'Goa', true, true, true),
('2023A7PS0003H@hyderabad.bits-pilani.ac.in', '2023A7PS0003H', 'Rohit Kumar', 'rohit_dev', 'Blockchain developer and gaming enthusiast', 21, 'male', 2, 'Computer Science', 'Hyderabad', true, true, true),
('2021A1PS0004P@pilani.bits-pilani.ac.in', '2021A1PS0004P', 'Sneha Gupta', 'sneha_design', 'UX designer with a passion for digital art and literature', 23, 'female', 4, 'Design', 'Pilani', true, true, true),
('2022A2PS0005G@goa.bits-pilani.ac.in', '2022A2PS0005G', 'Vikram Singh', 'vikram_mech', 'DevOps engineer who loves mountains and experimenting with recipes', 22, 'male', 3, 'Mechanical Engineering', 'Goa', true, true, true),
('2023A7PS0006P@pilani.bits-pilani.ac.in', '2023A7PS0006P', 'Ananya Reddy', 'ananya_ml', 'ML researcher and classical dancer, active in social causes', 21, 'female', 2, 'Computer Science', 'Pilani', true, true, true),
('2022A7PS0007H@hyderabad.bits-pilani.ac.in', '2022A7PS0007H', 'Karthik Menon', 'karthik_sec', 'Cybersecurity specialist, chess player, podcast enthusiast', 22, 'male', 3, 'Computer Science', 'Hyderabad', true, true, true),
('2021A8PS0008G@goa.bits-pilani.ac.in', '2021A8PS0008G', 'Ishita Jain', 'ishita_pm', 'Product manager at a fintech startup, yoga instructor on weekends', 23, 'female', 4, 'Economics', 'Goa', true, true, true),
('2023A7PS0009P@pilani.bits-pilani.ac.in', '2023A7PS0009P', 'Aditya Kulkarni', 'aditya_full', 'Full stack developer and music producer', 21, 'male', 2, 'Computer Science', 'Pilani', true, true, true),
('2022A4PS0010H@hyderabad.bits-pilani.ac.in', '2022A4PS0010H', 'Divya Nair', 'divya_data', 'Data scientist with a keen eye for photography and travel stories', 22, 'female', 3, 'Mathematics', 'Hyderabad', true, true, true);

-- Insert user interests
INSERT INTO user_interests (user_id, interest, weight) 
SELECT 
    u.id, 
    interest_data.interest,
    interest_data.weight
FROM users u
CROSS JOIN (
    VALUES 
    ('2021A7PS0001P@pilani.bits-pilani.ac.in', 'Machine Learning', 1.0),
    ('2021A7PS0001P@pilani.bits-pilani.ac.in', 'Cricket', 0.8),
    ('2021A7PS0001P@pilani.bits-pilani.ac.in', 'Photography', 0.9),
    
    ('2022A3PS0002G@goa.bits-pilani.ac.in', 'Data Science', 1.0),
    ('2022A3PS0002G@goa.bits-pilani.ac.in', 'Travel', 0.7),
    ('2022A3PS0002G@goa.bits-pilani.ac.in', 'Music', 0.6),
    
    ('2023A7PS0003H@hyderabad.bits-pilani.ac.in', 'Blockchain', 1.0),
    ('2023A7PS0003H@hyderabad.bits-pilani.ac.in', 'Gaming', 0.9),
    ('2023A7PS0003H@hyderabad.bits-pilani.ac.in', 'Fitness', 0.7),
    
    ('2021A1PS0004P@pilani.bits-pilani.ac.in', 'UI/UX Design', 1.0),
    ('2021A1PS0004P@pilani.bits-pilani.ac.in', 'Art', 0.8),
    ('2021A1PS0004P@pilani.bits-pilani.ac.in', 'Books', 0.7),
    
    ('2022A2PS0005G@goa.bits-pilani.ac.in', 'DevOps', 1.0),
    ('2022A2PS0005G@goa.bits-pilani.ac.in', 'Trekking', 0.9),
    ('2022A2PS0005G@goa.bits-pilani.ac.in', 'Cooking', 0.6),
    
    ('2023A7PS0006P@pilani.bits-pilani.ac.in', 'Machine Learning', 1.0),
    ('2023A7PS0006P@pilani.bits-pilani.ac.in', 'Dance', 0.8),
    ('2023A7PS0006P@pilani.bits-pilani.ac.in', 'Volunteering', 0.7),
    
    ('2022A7PS0007H@hyderabad.bits-pilani.ac.in', 'Cybersecurity', 1.0),
    ('2022A7PS0007H@hyderabad.bits-pilani.ac.in', 'Chess', 0.8),
    ('2022A7PS0007H@hyderabad.bits-pilani.ac.in', 'Podcasts', 0.6),
    
    ('2021A8PS0008G@goa.bits-pilani.ac.in', 'Product Management', 1.0),
    ('2021A8PS0008G@goa.bits-pilani.ac.in', 'Yoga', 0.8),
    ('2021A8PS0008G@goa.bits-pilani.ac.in', 'Startups', 0.9),
    
    ('2023A7PS0009P@pilani.bits-pilani.ac.in', 'Full Stack Development', 1.0),
    ('2023A7PS0009P@pilani.bits-pilani.ac.in', 'Music Production', 0.9),
    ('2023A7PS0009P@pilani.bits-pilani.ac.in', 'Gaming', 0.7),
    
    ('2022A4PS0010H@hyderabad.bits-pilani.ac.in', 'Data Science', 1.0),
    ('2022A4PS0010H@hyderabad.bits-pilani.ac.in', 'Photography', 0.9),
    ('2022A4PS0010H@hyderabad.bits-pilani.ac.in', 'Travel', 0.8)
) AS interest_data(email, interest, weight)
WHERE u.bits_email = interest_data.email;

-- Insert some connections (friendships)
INSERT INTO connections (user1_id, user2_id, connection_type, status, compatibility_score) 
SELECT 
    u1.id, u2.id, 'friend', 'accepted', 0.85
FROM users u1, users u2 
WHERE u1.bits_email = '2021A7PS0001P@pilani.bits-pilani.ac.in' 
  AND u2.bits_email IN ('2022A3PS0002G@goa.bits-pilani.ac.in', '2023A7PS0003H@hyderabad.bits-pilani.ac.in')
  AND u1.id != u2.id;

INSERT INTO connections (user1_id, user2_id, connection_type, status, compatibility_score) 
SELECT 
    u1.id, u2.id, 'friend', 'accepted', 0.78
FROM users u1, users u2 
WHERE u1.bits_email = '2021A1PS0004P@pilani.bits-pilani.ac.in' 
  AND u2.bits_email IN ('2022A2PS0005G@goa.bits-pilani.ac.in', '2023A7PS0006P@pilani.bits-pilani.ac.in')
  AND u1.id != u2.id;

-- Insert some daily matches (AI recommendations)
INSERT INTO daily_matches (user_id, matched_user_id, compatibility_score, algorithm_version, viewed, action)
SELECT 
    u1.id, u2.id, 0.92, 'v1.2', true, 'connect'
FROM users u1, users u2 
WHERE u1.bits_email = '2021A7PS0001P@pilani.bits-pilani.ac.in' 
  AND u2.bits_email = '2023A7PS0006P@pilani.bits-pilani.ac.in'
  AND u1.id != u2.id;

INSERT INTO daily_matches (user_id, matched_user_id, compatibility_score, algorithm_version, viewed)
SELECT 
    u1.id, u2.id, 0.87, 'v1.2', false
FROM users u1, users u2 
WHERE u1.bits_email = '2022A3PS0002G@goa.bits-pilani.ac.in' 
  AND u2.bits_email IN ('2022A4PS0010H@hyderabad.bits-pilani.ac.in', '2021A8PS0008G@goa.bits-pilani.ac.in')
  AND u1.id != u2.id;

-- Insert some ships (third-party matchmaking)
INSERT INTO ships (shipper_id, user1_id, user2_id, message, status)
SELECT 
    u1.id, u2.id, u3.id, 'You two would make a great pair! Both love ML and have similar interests.', 'pending'
FROM users u1, users u2, users u3
WHERE u1.bits_email = '2022A7PS0007H@hyderabad.bits-pilani.ac.in'  -- shipper
  AND u2.bits_email = '2021A7PS0001P@pilani.bits-pilani.ac.in'     -- user1
  AND u3.bits_email = '2023A7PS0006P@pilani.bits-pilani.ac.in'     -- user2
  AND u1.id != u2.id AND u1.id != u3.id AND u2.id != u3.id;

-- Insert some notifications
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id, 
    'match', 
    'New Match!', 
    'You have a new daily match with high compatibility!',
    '{"match_id": "daily", "compatibility": 0.92}'::jsonb
FROM users u 
WHERE u.bits_email = '2021A7PS0001P@pilani.bits-pilani.ac.in';

INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id, 
    'ship', 
    'Someone shipped you!', 
    'A friend thinks you and another user would be perfect together.',
    '{"ship_type": "friend_suggestion"}'::jsonb
FROM users u 
WHERE u.bits_email = '2023A7PS0006P@pilani.bits-pilani.ac.in';

-- Verify data insertion with proper metrics
SELECT 
    'Total Users' as metric, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'Verified BITS Users' as metric, 
    COUNT(*) as count 
FROM users 
WHERE verified = true
UNION ALL
SELECT 
    'User Interests' as metric, 
    COUNT(*) as count 
FROM user_interests
UNION ALL
SELECT 
    'Connections' as metric, 
    COUNT(*) as count 
FROM connections
UNION ALL
SELECT 
    'Daily Matches' as metric, 
    COUNT(*) as count 
FROM daily_matches
UNION ALL
SELECT 
    'Ships' as metric, 
    COUNT(*) as count 
FROM ships
UNION ALL
SELECT 
    'Notifications' as metric, 
    COUNT(*) as count 
FROM notifications;

-- Display sample users for verification
SELECT 
    bits_email, 
    display_name, 
    branch, 
    campus,
    year,
    verified,
    (SELECT COUNT(*) FROM user_interests ui WHERE ui.user_id = u.id) as interest_count
FROM users u
ORDER BY created_at
LIMIT 5;
