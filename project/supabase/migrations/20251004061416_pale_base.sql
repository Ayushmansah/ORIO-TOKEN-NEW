/*
  # Add KYC Requests Table

  1. New Tables
    - `kyc_requests`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required, unique)
      - `phone` (text, required)
      - `pid` (text, required, unique)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `kyc_requests` table
    - Add policy for users to read their own KYC requests
    - Add policy for dealer to read and update all KYC requests
*/

CREATE TABLE IF NOT EXISTS kyc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  pid text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own KYC requests
CREATE POLICY "Users can read own KYC requests"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'::text));

-- Users can insert their own KYC requests
CREATE POLICY "Users can insert own KYC requests"
  ON kyc_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (auth.jwt() ->> 'email'::text));

-- Dealer can read all KYC requests
CREATE POLICY "Dealer can read all KYC requests"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'rajsanitationkatihar@gmail.com'::text);

-- Dealer can update KYC request status
CREATE POLICY "Dealer can update KYC requests"
  ON kyc_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'rajsanitationkatihar@gmail.com'::text);