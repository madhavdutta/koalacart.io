/*
# Fix Products Edit RLS Policy

## Changes Made
1. **UPDATE Policy Fix**
   - Update the UPDATE policy to properly allow admin users to edit their products
   - Add WITH CHECK clause to ensure data integrity during updates
   - Match the successful INSERT policy pattern

2. **Policy Logic**
   - Ensure authenticated admin users can update products they own
   - Maintain security while allowing legitimate edit operations
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Admins can update own products" ON products;

-- Create a new UPDATE policy that works properly
CREATE POLICY "Admins can update own products" ON products
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = admin_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = admin_id
    )
  );
