-- Fix infinite recursion in RLS policies
-- This script fixes the problematic RLS policy that causes infinite recursion

BEGIN;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Verified users can view other verified profiles" ON users;

-- Create a simpler, non-recursive policy
CREATE POLICY "Verified users can view other verified profiles" ON users 
    FOR SELECT USING (
        verified = true 
        AND privacy_settings->>'discoverable' = 'true'
    );

-- Also ensure the basic policies are correct
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Recreate basic policies without recursion issues
CREATE POLICY "Users can view their own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id AND is_bits_email(email));

COMMIT;
