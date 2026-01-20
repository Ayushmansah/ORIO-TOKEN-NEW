/*
  # Create plumbers table and token system

  1. New Tables
    - `plumbers`
      - `id` (uuid, primary key)
      - `pid` (text, unique 4-digit identifier)
      - `name` (text)
      - `email` (text, unique)
      - `tokens` (integer, default 0)
      - `total_earned` (integer, default 0)
      - `total_redeemed` (integer, default 0)
      - `created_at` (timestamp)
    - `token_transactions`
      - `id` (uuid, primary key)
      - `plumber_id` (uuid, foreign key)
      - `type` (text, 'earned' or 'redeemed')
      - `tokens` (integer)
      - `description` (text)
      - `created_at` (timestamp)
    - `redemptions`
      - `id` (uuid, primary key)
      - `plumber_id` (uuid, foreign key)
      - `reward_name` (text)
      - `tokens_used` (integer)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for dealer access

  3. Sample Data
    - Insert sample plumbers with PIDs
*/

-- Create plumbers table
CREATE TABLE IF NOT EXISTS plumbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  tokens integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  total_redeemed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plumber_id uuid REFERENCES plumbers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed')),
  tokens integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plumber_id uuid REFERENCES plumbers(id) ON DELETE CASCADE,
  reward_name text NOT NULL,
  tokens_used integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plumbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for plumbers table
CREATE POLICY "Plumbers can read own data"
  ON plumbers
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Dealer can read all plumbers"
  ON plumbers
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

CREATE POLICY "Dealer can update plumber tokens"
  ON plumbers
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

-- Policies for token_transactions table
CREATE POLICY "Users can read own transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (
    plumber_id IN (
      SELECT id FROM plumbers WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Dealer can read all transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

CREATE POLICY "Dealer can insert transactions"
  ON token_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

-- Policies for redemptions table
CREATE POLICY "Users can read own redemptions"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (
    plumber_id IN (
      SELECT id FROM plumbers WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can insert own redemptions"
  ON redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    plumber_id IN (
      SELECT id FROM plumbers WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Dealer can read all redemptions"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

CREATE POLICY "Dealer can update redemption status"
  ON redemptions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rajsanitationkatihar@gmail.com');

-- Insert sample plumbers
INSERT INTO plumbers (pid, name, email, tokens, total_earned, total_redeemed) VALUES
  ('1001', 'Rajesh Kumar', 'rajesh.kumar@example.com', 12, 25, 13),
  ('1002', 'Suresh Singh', 'suresh.singh@example.com', 8, 18, 10),
  ('1003', 'Amit Sharma', 'amit.sharma@example.com', 15, 20, 5),
  ('1004', 'Vikash Yadav', 'vikash.yadav@example.com', 6, 12, 6),
  ('1005', 'Ravi Kumar', 'ravi.kumar@example.com', 9, 15, 6)
ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions
INSERT INTO token_transactions (plumber_id, type, tokens, description) 
SELECT 
  p.id,
  'earned',
  3,
  '3 PCS 4-Way Concealed Divertor'
FROM plumbers p
WHERE p.email = 'rajesh.kumar@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO token_transactions (plumber_id, type, tokens, description) 
SELECT 
  p.id,
  'earned',
  5,
  '5 PCS 4-Way Concealed Divertor'
FROM plumbers p
WHERE p.email = 'suresh.singh@example.com'
ON CONFLICT DO NOTHING;