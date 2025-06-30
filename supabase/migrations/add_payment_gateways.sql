/*
  # Add Payment Gateways Table

  1. New Tables
    - `payment_gateways`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `gateway_type` (text, stripe/paypal)
      - `publishable_key` (text, for Stripe)
      - `secret_key` (text, encrypted)
      - `webhook_secret` (text, for webhooks)
      - `client_id` (text, for PayPal)
      - `client_secret` (text, for PayPal)
      - `mode` (text, sandbox/live for PayPal)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payment_gateways` table
    - Add policy for users to manage their own payment gateways

  3. Changes
    - Add profile fields for phone, company, website
*/

-- Add payment gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gateway_type text NOT NULL CHECK (gateway_type IN ('stripe', 'paypal')),
  publishable_key text,
  secret_key text,
  webhook_secret text,
  client_id text,
  client_secret text,
  mode text DEFAULT 'sandbox' CHECK (mode IN ('sandbox', 'live')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, gateway_type)
);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own payment gateways"
  ON payment_gateways
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add additional profile fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;
END $$;
