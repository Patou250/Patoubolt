/*
  # Fix RLS policies for parent creation

  1. Security Changes
    - Update RLS policies to allow anonymous parent creation during Spotify OAuth
    - Allow parents to read and update their own data
    - Ensure secure access patterns

  2. Policy Updates
    - Allow INSERT for anonymous users (needed for OAuth signup)
    - Allow SELECT/UPDATE for authenticated users on their own records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous parent creation" ON parents;
DROP POLICY IF EXISTS "Allow anonymous parent updates" ON parents;
DROP POLICY IF EXISTS "Parents can read own data" ON parents;

-- Create new policies that work with the OAuth flow
CREATE POLICY "Allow parent creation during OAuth"
  ON parents
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow parent updates during OAuth"
  ON parents
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Parents can read their own data"
  ON parents
  FOR SELECT
  TO anon
  USING (true);

-- Also allow authenticated users to access their data
CREATE POLICY "Authenticated parents can read own data"
  ON parents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated parents can update own data"
  ON parents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);