/*
  # Update parents table policies for anonymous access

  1. Security Changes
    - Allow anonymous users to insert/update parents (for Spotify auth)
    - Keep read access restricted to authenticated users
    - Ensure proper RLS policies for parent operations

  2. Policy Updates
    - Update insert policy to allow anonymous users
    - Update update policy to allow anonymous users
    - Keep select policy for authenticated users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow parent creation" ON parents;
DROP POLICY IF EXISTS "Parents can update own data" ON parents;

-- Create new policies that allow anonymous operations for Spotify auth
CREATE POLICY "Allow anonymous parent creation"
  ON parents
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous parent updates"
  ON parents
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Keep the existing select policy for authenticated users
-- This ensures only authenticated users can read parent data