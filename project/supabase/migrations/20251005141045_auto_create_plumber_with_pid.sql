/*
  # Auto-Create Plumber Profile on User Signup

  1. New Functions
    - `generate_unique_pid()` - Generates a unique 4-digit PID
    - `handle_new_user()` - Trigger function to create plumber profile on user signup

  2. Changes
    - Add default value for PID column using generate_unique_pid()
    - Create trigger on auth.users to auto-create plumber profile
    - Set default values for tokens, total_earned, total_redeemed

  3. Security
    - Maintains existing RLS policies
    - Trigger runs with security definer privileges
*/

-- Function to generate unique 4-digit PID
CREATE OR REPLACE FUNCTION generate_unique_pid()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_pid text;
  pid_exists boolean;
BEGIN
  LOOP
    -- Generate random 4-digit number
    new_pid := LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');
    
    -- Check if PID already exists
    SELECT EXISTS(SELECT 1 FROM plumbers WHERE pid = new_pid) INTO pid_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT pid_exists;
  END LOOP;
  
  RETURN new_pid;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  -- Skip if user is the dealer
  IF NEW.email = 'rajsanitationkatihar@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Get name from metadata or use email username
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insert new plumber profile
  INSERT INTO plumbers (
    name,
    email,
    pid,
    tokens,
    total_earned,
    total_redeemed
  )
  VALUES (
    user_name,
    NEW.email,
    generate_unique_pid(),
    0,
    0,
    0
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update existing plumbers without PIDs to have unique PIDs
DO $$
DECLARE
  plumber_record RECORD;
BEGIN
  FOR plumber_record IN 
    SELECT id FROM plumbers WHERE pid IS NULL OR pid = ''
  LOOP
    UPDATE plumbers 
    SET pid = generate_unique_pid()
    WHERE id = plumber_record.id;
  END LOOP;
END $$;

-- Make PID NOT NULL after ensuring all have values
ALTER TABLE plumbers ALTER COLUMN pid SET NOT NULL;

-- Set default values for numeric columns
ALTER TABLE plumbers ALTER COLUMN tokens SET DEFAULT 0;
ALTER TABLE plumbers ALTER COLUMN total_earned SET DEFAULT 0;
ALTER TABLE plumbers ALTER COLUMN total_redeemed SET DEFAULT 0;
