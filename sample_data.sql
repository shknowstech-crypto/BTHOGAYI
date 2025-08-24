-- BITSPARK Sample Data Script for Supabase
-- Run this script in the Supabase SQL Editor to populate your database with test data

-- First, let's create the tables if they don't exist
-- (Adjust table structure based on your actual schema)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    profile_pic_url TEXT,
    interests TEXT[], -- Array of interests
    batch_year INTEGER,
    department VARCHAR(100),
    location VARCHAR(100),
    bio TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User connections/friendships
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_type VARCHAR(20) DEFAULT 'friend', -- friend, blocked, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, connected_user_id)
);

-- User interactions (for recommendation engine)
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20), -- view, like, message, connect
    interaction_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback for recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommended_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20), -- like, dislike, connect, block
    feedback_score INTEGER, -- -1 to 1
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample users (BITS alumni/students)
INSERT INTO users (email, full_name, interests, batch_year, department, location, bio, verification_status) VALUES 
-- Verified BITS students/alumni
('test1@pilani.bits-pilani.ac.in', 'Arjun Sharma', ARRAY['Machine Learning', 'Cricket', 'Photography'], 2024, 'Computer Science', 'Bangalore', 'CS grad passionate about AI and sports photography', 'verified'),
('test2@goa.bits-pilani.ac.in', 'Priya Patel', ARRAY['Data Science', 'Travel', 'Music'], 2023, 'Electronics', 'Mumbai', 'Electronics engineer turned data scientist, love exploring new places', 'verified'),
('test3@hyderabad.bits-pilani.ac.in', 'Rohit Kumar', ARRAY['Blockchain', 'Gaming', 'Fitness'], 2024, 'Computer Science', 'Hyderabad', 'Blockchain developer and gaming enthusiast', 'verified'),
('test4@pilani.bits-pilani.ac.in', 'Sneha Gupta', ARRAY['UI/UX Design', 'Art', 'Books'], 2022, 'Design', 'Delhi', 'UX designer with a passion for digital art and literature', 'verified'),
('test5@goa.bits-pilani.ac.in', 'Vikram Singh', ARRAY['DevOps', 'Trekking', 'Cooking'], 2023, 'Mechanical', 'Pune', 'DevOps engineer who loves mountains and experimenting with recipes', 'verified'),
('test6@pilani.bits-pilani.ac.in', 'Ananya Reddy', ARRAY['Machine Learning', 'Dance', 'Volunteering'], 2024, 'Computer Science', 'Chennai', 'ML researcher and classical dancer, active in social causes', 'verified'),
('test7@hyderabad.bits-pilani.ac.in', 'Karthik Menon', ARRAY['Cybersecurity', 'Chess', 'Podcasts'], 2023, 'Computer Science', 'Bangalore', 'Cybersecurity specialist, chess player, podcast enthusiast', 'verified'),
('test8@goa.bits-pilani.ac.in', 'Ishita Jain', ARRAY['Product Management', 'Yoga', 'Startups'], 2022, 'Economics', 'Bangalore', 'Product manager at a fintech startup, yoga instructor on weekends', 'verified'),
('test9@pilani.bits-pilani.ac.in', 'Aditya Kulkarni', ARRAY['Full Stack Development', 'Music Production', 'Gaming'], 2024, 'Computer Science', 'Mumbai', 'Full stack developer and music producer', 'verified'),
('test10@hyderabad.bits-pilani.ac.in', 'Divya Nair', ARRAY['Data Science', 'Photography', 'Travel'], 2023, 'Mathematics', 'Kochi', 'Data scientist with a keen eye for photography and travel stories', 'verified'),

-- A few non-BITS emails (should not get recommendations)
('external1@gmail.com', 'Random User', ARRAY['Tech'], 2024, 'CS', 'Unknown', 'External user', 'pending'),
('external2@yahoo.com', 'Another User', ARRAY['Music'], 2023, 'Arts', 'Unknown', 'Another external user', 'pending');

-- Insert some connections (friendships)
INSERT INTO user_connections (user_id, connected_user_id, connection_type) 
SELECT 
    u1.id, u2.id, 'friend'
FROM users u1, users u2 
WHERE u1.email = 'test1@pilani.bits-pilani.ac.in' 
  AND u2.email IN ('test2@goa.bits-pilani.ac.in', 'test3@hyderabad.bits-pilani.ac.in')
  AND u1.id != u2.id;

INSERT INTO user_connections (user_id, connected_user_id, connection_type) 
SELECT 
    u1.id, u2.id, 'friend'
FROM users u1, users u2 
WHERE u1.email = 'test4@pilani.bits-pilani.ac.in' 
  AND u2.email IN ('test5@goa.bits-pilani.ac.in', 'test6@pilani.bits-pilani.ac.in')
  AND u1.id != u2.id;

-- Insert user interactions (for ML training data)
-- User 1 (Arjun) has viewed and liked users with similar interests
INSERT INTO user_interactions (user_id, target_user_id, interaction_type, interaction_score)
SELECT 
    u1.id, u2.id, 'view', 1.0
FROM users u1, users u2 
WHERE u1.email = 'test1@pilani.bits-pilani.ac.in' 
  AND u2.email IN ('test6@pilani.bits-pilani.ac.in', 'test7@hyderabad.bits-pilani.ac.in', 'test9@pilani.bits-pilani.ac.in')
  AND u1.id != u2.id;

INSERT INTO user_interactions (user_id, target_user_id, interaction_type, interaction_score)
SELECT 
    u1.id, u2.id, 'like', 2.0
FROM users u1, users u2 
WHERE u1.email = 'test1@pilani.bits-pilani.ac.in' 
  AND u2.email = 'test6@pilani.bits-pilani.ac.in'
  AND u1.id != u2.id;

-- User 2 (Priya) interactions
INSERT INTO user_interactions (user_id, target_user_id, interaction_type, interaction_score)
SELECT 
    u1.id, u2.id, 'view', 1.0
FROM users u1, users u2 
WHERE u1.email = 'test2@goa.bits-pilani.ac.in' 
  AND u2.email IN ('test10@hyderabad.bits-pilani.ac.in', 'test8@goa.bits-pilani.ac.in')
  AND u1.id != u2.id;

-- Add some recommendation feedback
INSERT INTO recommendation_feedback (user_id, recommended_user_id, feedback_type, feedback_score)
SELECT 
    u1.id, u2.id, 'like', 1
FROM users u1, users u2 
WHERE u1.email = 'test1@pilani.bits-pilani.ac.in' 
  AND u2.email = 'test6@pilani.bits-pilani.ac.in'
  AND u1.id != u2.id;

INSERT INTO recommendation_feedback (user_id, recommended_user_id, feedback_type, feedback_score)
SELECT 
    u1.id, u2.id, 'dislike', -1
FROM users u1, users u2 
WHERE u1.email = 'test2@goa.bits-pilani.ac.in' 
  AND u2.email = 'test5@goa.bits-pilani.ac.in'
  AND u1.id != u2.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);

-- Verify data insertion
SELECT 
    'Total Users' as metric, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'BITS Users' as metric, 
    COUNT(*) as count 
FROM users 
WHERE email LIKE '%@%.bits-pilani.ac.in'
UNION ALL
SELECT 
    'Connections' as metric, 
    COUNT(*) as count 
FROM user_connections
UNION ALL
SELECT 
    'Interactions' as metric, 
    COUNT(*) as count 
FROM user_interactions
UNION ALL
SELECT 
    'Feedback Records' as metric, 
    COUNT(*) as count 
FROM recommendation_feedback;

-- Display sample users for verification
SELECT 
    email, 
    full_name, 
    department, 
    array_length(interests, 1) as interest_count,
    verification_status
FROM users 
WHERE email LIKE '%@%.bits-pilani.ac.in'
ORDER BY created_at
LIMIT 5;
