/*
  # Initial Schema for ThriveCart Clone

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `products` - Digital/physical products with pricing options
    - `product_variants` - Product variants for different pricing tiers
    - `checkout_pages` - Custom checkout page configurations
    - `orders` - Order tracking and management
    - `order_items` - Individual items within orders
    - `affiliates` - Affiliate partner management
    - `affiliate_links` - Unique tracking links for affiliates
    - `affiliate_commissions` - Commission tracking and payouts
    - `coupons` - Discount codes and promotions
    - `analytics_events` - Event tracking for analytics
    - `webhooks` - Webhook configurations for integrations

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
    - Secure data access based on user permissions

  3. Features
    - Multi-role user system (Admin, Affiliate, Buyer)
    - Product management with variants and pricing
    - Affiliate tracking and commission system
    - Analytics and reporting
    - Webhook integrations
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'affiliate', 'buyer');
CREATE TYPE product_type AS ENUM ('digital', 'physical');
CREATE TYPE pricing_type AS ENUM ('one_time', 'subscription', 'trial');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'buyer',
  avatar_url text,
  stripe_customer_id text,
  stripe_account_id text, -- For affiliate payouts
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  product_type product_type DEFAULT 'digital',
  pricing_type pricing_type DEFAULT 'one_time',
  base_price decimal(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  image_url text,
  download_url text, -- For digital products
  is_active boolean DEFAULT true,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  stripe_price_id text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Checkout pages table
CREATE TABLE IF NOT EXISTS checkout_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  custom_fields jsonb DEFAULT '[]',
  theme_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  affiliate_id uuid REFERENCES profiles(id),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_session_id text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table (for future cart functionality)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  commission_rate decimal(5,2) DEFAULT 10.00, -- Percentage
  total_earnings decimal(10,2) DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tracking_code text UNIQUE NOT NULL,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Affiliate commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  commission_rate decimal(5,2) NOT NULL,
  status commission_status DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_amount decimal(10,2) DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  product_id uuid REFERENCES products(id),
  affiliate_id uuid REFERENCES affiliates(id),
  order_id uuid REFERENCES orders(id),
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage their products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = products.admin_id
    )
  );

-- Product variants policies
CREATE POLICY "Anyone can read variants of active products"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.is_active = true
    )
  );

CREATE POLICY "Admins can manage variants of their products"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN profiles pr ON pr.id = p.admin_id
      WHERE p.id = product_variants.product_id
      AND pr.user_id = auth.uid()
      AND pr.role = 'admin'
    )
  );

-- Checkout pages policies
CREATE POLICY "Anyone can read active checkout pages"
  ON checkout_pages FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = checkout_pages.product_id 
      AND products.is_active = true
    )
  );

CREATE POLICY "Admins can manage checkout pages for their products"
  ON checkout_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN profiles pr ON pr.id = p.admin_id
      WHERE p.id = checkout_pages.product_id
      AND pr.user_id = auth.uid()
      AND pr.role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can read their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.email = orders.customer_email
    )
  );

CREATE POLICY "Admins can read orders for their products"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN profiles pr ON pr.id = p.admin_id
      WHERE p.id = orders.product_id
      AND pr.user_id = auth.uid()
      AND pr.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Affiliates policies
CREATE POLICY "Affiliates can read their own data"
  ON affiliates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = affiliates.profile_id
    )
  );

CREATE POLICY "Admins can manage their affiliates"
  ON affiliates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.id = affiliates.admin_id
    )
  );

-- Affiliate links policies
CREATE POLICY "Affiliates can read their own links"
  ON affiliate_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliates a
      JOIN profiles p ON p.id = a.profile_id
      WHERE a.id = affiliate_links.affiliate_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read affiliate links for tracking"
  ON affiliate_links FOR SELECT
  TO anon, authenticated
  USING (true);

-- Affiliate commissions policies
CREATE POLICY "Affiliates can read their own commissions"
  ON affiliate_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliates a
      JOIN profiles p ON p.id = a.profile_id
      WHERE a.id = affiliate_commissions.affiliate_id
      AND p.user_id = auth.uid()
    )
  );

-- Analytics events policies
CREATE POLICY "Admins can read analytics for their products"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN profiles pr ON pr.id = p.admin_id
      WHERE p.id = analytics_events.product_id
      AND pr.user_id = auth.uid()
      AND pr.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create analytics events"
  ON analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_products_admin_id ON products(admin_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX idx_affiliate_links_tracking_code ON affiliate_links(tracking_code);
CREATE INDEX idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkout_pages_updated_at BEFORE UPDATE ON checkout_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
