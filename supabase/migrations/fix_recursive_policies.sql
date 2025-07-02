/*
  # Fix Infinite Recursion in Profile Policies

  1. Security Updates
    - Drop ALL existing policies to clear recursion
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparisons without complex logic
    - Ensure no policy references cause circular dependencies

  2. Policy Strategy
    - Simple INSERT policy for profile creation
    - Simple SELECT policy for reading own data
    - Simple UPDATE policy for modifying own data
    - No complex joins or subqueries that could cause recursion
*/

-- Disable RLS temporarily to clear all policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());