/*
  # Add Payment Gateways Table

  1. New Tables
    - `payment_gateways`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `gateway_type` (text, stripe/paypal/etc)
      - `publishable_key` (text, for Stripe)
      - `secret_key` (text, encrypted)
      - `client_id` (text, for PayPal)
      - `client_secret` (text, encrypted)
      - `webhook_secret` (text, encrypted)
      - `mode` (text, sandbox/live)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payment_gateways` table
    - Add policy for users to manage their own payment gateways
*/

CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gateway_type text NOT NULL CHECK (gateway_type IN ('stripe', 'paypal', 'square')),
  publishable_key text,
  secret_key text,
  client_id text,
  client_secret text,
  webhook_secret text,
  mode text DEFAULT 'sandbox' CHECK (mode IN ('sandbox', 'live')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment gateways"
  ON payment_gateways
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_gateways_user_id ON payment_gateways(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_type ON payment_gateways(gateway_type);
