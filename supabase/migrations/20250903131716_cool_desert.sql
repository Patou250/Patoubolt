/*
  # Create children table and authentication system

  1. New Tables
    - `children`
      - `id` (uuid, primary key)
      - `name` (text, child's name)
      - `emoji` (text, child's avatar emoji)
      - `pin_hash` (text, bcrypt hashed PIN)
      - `parent_id` (uuid, foreign key to parents)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `children` table
    - Add policies for parents to manage their children
    - Add policies for anonymous access during child login
*/

CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '👶',
  pin_hash text NOT NULL,
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own children
CREATE POLICY "Parents can read their own children"
  ON children
  FOR SELECT
  TO authenticated
  USING (parent_id IN (
    SELECT id FROM parents WHERE spotify_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Parents can create children"
  ON children
  FOR INSERT
  TO authenticated
  WITH CHECK (parent_id IN (
    SELECT id FROM parents WHERE spotify_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Parents can update their own children"
  ON children
  FOR UPDATE
  TO authenticated
  USING (parent_id IN (
    SELECT id FROM parents WHERE spotify_id = auth.jwt() ->> 'sub'
  ))
  WITH CHECK (parent_id IN (
    SELECT id FROM parents WHERE spotify_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Parents can delete their own children"
  ON children
  FOR DELETE
  TO authenticated
  USING (parent_id IN (
    SELECT id FROM parents WHERE spotify_id = auth.jwt() ->> 'sub'
  ));

-- Allow anonymous access for child login verification
CREATE POLICY "Allow anonymous child login verification"
  ON children
  FOR SELECT
  TO anon
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS children_parent_id_idx ON children(parent_id);