/*
  # Fix Profile Creation Policies - Version 2

  1. Updates
    - Drop all existing profile policies by their exact names
    - Recreate with proper permissions for profile creation
    - Ensure authenticated users can create profiles

  2. Security
    - Maintain RLS while allowing proper profile creation
    - Add policy for profile creation during registration
*/

-- Drop all existing policies for profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Recreate policies with proper names and logic
CREATE POLICY "profile_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profile_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_insert_authenticated"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_select_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );