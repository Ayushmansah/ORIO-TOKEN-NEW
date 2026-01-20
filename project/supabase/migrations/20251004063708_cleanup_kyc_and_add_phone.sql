/*
  # Cleanup KYC System and Add Phone Column

  1. Changes
    - Add phone column to plumbers table
    - Drop kyc_requests table completely
    - Drop old migrations related to KYC

  2. Notes
    - Phone number is required for plumber registration
    - KYC approval system has been removed
    - Plumbers are verified immediately upon registration
*/

-- Add phone column to plumbers table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plumbers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE plumbers ADD COLUMN phone text;
  END IF;
END $$;

-- Drop kyc_requests table if it exists
DROP TABLE IF EXISTS kyc_requests CASCADE;
