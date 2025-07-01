/*
# Fix Products Table Relationships and RLS Policies

## Changes Made
1. **Foreign Key Relationships**
   - Add proper foreign key constraint between products and categories
   - Add foreign key constraint between products and profiles (admin_id)

2. **RLS Policy Updates**
   - Fix products policies to use proper profile relationships
   - Ensure authenticated users can create products
   - Update policies to work with the correct foreign key structure

3. **Data Integrity**
   - Ensure all relationships are properly established
   - Update existing data to maintain consistency
*/

-- First, let's ensure the foreign key relationships exist
-- Add foreign key constraint for products.category_id -> categories.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey' 
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for products.admin_id -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_admin_id_fkey' 
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage own products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create updated policies that work with the proper relationships
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

-- Update the product creation route to use profile.id instead of user.id
-- This will be handled in the application code

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_products_admin_id ON products(admin_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
