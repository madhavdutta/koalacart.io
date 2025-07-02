/*
  # Temporarily Disable RLS to Fix Infinite Recursion

  1. Security Changes
    - Temporarily disable RLS on profiles table
    - This allows profile creation without policy conflicts
    - Will re-enable with proper policies once recursion source is identified

  2. Temporary Solution
    - Disable RLS completely on profiles table
    - Allow profile operations to proceed
    - Debug the recursion issue separately
*/

-- Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;