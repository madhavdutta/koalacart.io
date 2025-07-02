/*
  # Fix Profile Creation Policies

  1. Security Updates
    - Drop existing restrictive policies that prevent profile creation
    - Add comprehensive policies for profile CRUD operations
    - Enable authenticated users to create and manage their own profiles
    - Allow profile creation during onboarding flow

  2. Policy Changes
    - Allow authenticated users to insert their own profile
    - Allow users to read their own profile data
    - Allow users to update their own profile
    - Prevent unauthorized access to other users' profiles
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive policies for profiles table
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;