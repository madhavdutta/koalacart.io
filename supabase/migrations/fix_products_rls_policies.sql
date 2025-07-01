/*
# Fix Products RLS Policies for Admin Creation

## Changes Made
1. **RLS Policy Updates**
   - Update products policies to allow proper admin access
   - Fix policy logic to work with profile relationships
   - Allow authenticated admins to create products

2. **Policy Structure**
   - Separate policies for different operations (SELECT, INSERT, UPDATE, DELETE)
   - Clear policy conditions for admin access
   - Proper foreign key relationship handling
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage own products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create updated policies that work properly
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = admin_id
    )
  );

CREATE POLICY "Admins can update own products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = admin_id
    )
  );

CREATE POLICY "Admins can delete own products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = admin_id
    )
  );