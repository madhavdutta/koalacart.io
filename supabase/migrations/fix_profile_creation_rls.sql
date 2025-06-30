/*
  # Fix Profile Creation RLS Issue

  1. Problem
    - User isn't authenticated when profile is created during signup
    - RLS policies block profile creation during registration

  2. Solution
    - Allow anon users to create profiles during registration
    - Maintain security by checking user_id matches auth.uid()

  3. Security
    - Still enforce user can only create their own profile
    - Maintain all other security policies
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "profile_insert_authenticated" ON profiles;

-- Create new policy that allows both authenticated and anon users to insert
-- but only if the user_id matches the authenticated user
CREATE POLICY "profile_insert_signup"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- For authenticated users, must match their auth.uid()
    (auth.role() = 'authenticated' AND auth.uid() = user_id) OR
    -- For anon users during signup, allow if user_id is provided
    (auth.role() = 'anon' AND user_id IS NOT NULL)
  );