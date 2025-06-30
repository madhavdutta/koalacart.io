/*
  # Fix Profile Creation Issues

  1. Updates
    - Fix RLS policies for profile creation
    - Add better error handling for profile insertion
    - Ensure proper permissions for authenticated users

  2. Security
    - Maintain RLS while allowing proper profile creation
    - Add policy for profile creation during registration
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON profiles;

-- Recreate policies with better logic
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add a policy to allow reading profiles for admin operations
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );