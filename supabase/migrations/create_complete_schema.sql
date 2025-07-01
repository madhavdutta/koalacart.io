/*
# Complete KoalaCart Database Schema

## Overview
This migration creates the complete database schema for KoalaCart with all necessary tables for a full-featured e-commerce platform with affiliate marketing capabilities.

## New Tables
1. **profiles** - User profile information with role-based access
2. **products** - Product catalog with pricing and metadata
3. **orders** - Order management and tracking
4. **affiliates** - Affiliate relationship management
5. **affiliate_links** - Tracking links for affiliate marketing
6. **commissions** - Commission tracking and payments
7. **product_variants** - Product variations and options
8. **categories** - Product categorization

## Security
- Row Level Security (RLS) enabled on all tables
- Policies for role-based access control
- Secure data access patterns

## Features
- Complete CRUD operations support
- Audit trails with timestamps
- Flexible product management
- Comprehensive affiliate system
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('admin', 'affiliate', 'buyer')) DEFAULT 'buyer',
  avatar_url text,
  stripe_customer_id text,
  stripe_account_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  product_type text CHECK (product_type IN ('digital', 'physical')) DEFAULT 'digital',
  pricing_type text CHECK (pricing_type IN ('one_time', 'subscription', 'trial')) DEFAULT 'one_time',
  base_price decimal(10,2) DEFAULT 0,
  sale_price decimal(10,2),
  currency text DEFAULT 'USD',
  image_url text,
  gallery_images text[],
  download_url text,
  file_size bigint,
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  stripe_product_id text,
  stripe_price_id text,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  sku text,
  inventory_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  options jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  billing_address jsonb,
  shipping_address jsonb,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  affiliate_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_status text CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  fulfillment_status text CHECK (fulfillment_status IN ('pending', 'fulfilled', 'shipped', 'delivered')) DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_session_id text,
  notes text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  commission_rate decimal(5,2) DEFAULT 10.00,
  total_earnings decimal(10,2) DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  is_active boolean DEFAULT true,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tracking_code text UNIQUE NOT NULL,
  custom_url text,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  last_clicked_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  rate decimal(5,2) NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage own products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = products.admin_id
    )
  );

-- Product variants policies
CREATE POLICY "Anyone can view active variants" ON product_variants
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.is_active = true)
  );

CREATE POLICY "Product owners can manage variants" ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      JOIN profiles ON profiles.id = products.admin_id
      WHERE products.id = product_variants.product_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    customer_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = (SELECT admin_id FROM products WHERE products.id = orders.product_id)
    )
  );

CREATE POLICY "Admins can manage orders for their products" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      JOIN products ON products.admin_id = profiles.id
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND products.id = orders.product_id
    )
  );

-- Affiliates policies
CREATE POLICY "Users can view own affiliate records" ON affiliates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (profiles.id = affiliates.profile_id OR profiles.id = affiliates.admin_id)
    )
  );

CREATE POLICY "Admins can manage their affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = affiliates.admin_id
    )
  );

-- Affiliate links policies
CREATE POLICY "Affiliates can manage own links" ON affiliate_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM affiliates 
      JOIN profiles ON profiles.id = affiliates.profile_id
      WHERE affiliates.id = affiliate_links.affiliate_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Commissions policies
CREATE POLICY "Users can view own commissions" ON commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates 
      JOIN profiles ON profiles.id = affiliates.profile_id
      WHERE affiliates.id = commissions.affiliate_id 
      AND profiles.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM affiliates 
      JOIN profiles ON profiles.id = affiliates.admin_id
      WHERE affiliates.id = commissions.affiliate_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_admin_id ON products(admin_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_profile_id ON affiliates(profile_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_tracking_code ON affiliate_links(tracking_code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Digital Courses', 'digital-courses', 'Online courses and educational content', true),
('Software Tools', 'software-tools', 'Digital software and applications', true),
('E-books', 'ebooks', 'Digital books and publications', true),
('Templates', 'templates', 'Design templates and resources', true),
('Consulting', 'consulting', 'Professional consulting services', true)
ON CONFLICT (slug) DO NOTHING;
