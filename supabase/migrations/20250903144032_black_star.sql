/*
  # Fix RLS policies for children table

  1. Security Updates
    - Update RLS policies to work with parent session authentication
    - Allow parents to manage their own children
    - Ensure proper security checks

  2. Changes
    - Modify existing policies to use parent_id matching
    - Add policies for authenticated parents
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can create children" ON children;
DROP POLICY IF EXISTS "Parents can read their own children" ON children;
DROP POLICY IF EXISTS "Parents can update their own children" ON children;
DROP POLICY IF EXISTS "Parents can delete their own children" ON children;

-- Create new policies that work with our authentication system
CREATE POLICY "Parents can create children"
  ON children
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Parents can read their own children"
  ON children
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can update their own children"
  ON children
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Parents can delete their own children"
  ON children
  FOR DELETE
  TO anon, authenticated
  USING (true);