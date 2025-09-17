/*
  # Fix children table constraints and structure

  1. Tables
    - Update children table structure to match expected schema
    - Handle existing constraints properly
    - Ensure compatibility with existing data

  2. Security
    - Maintain RLS policies
    - Preserve existing permissions
*/

-- First, let's check if we need to modify the table structure
DO $$
BEGIN
  -- Check if the table has the expected columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'name'
  ) THEN
    -- Add name column if it doesn't exist
    ALTER TABLE children ADD COLUMN name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'emoji'
  ) THEN
    -- Add emoji column if it doesn't exist
    ALTER TABLE children ADD COLUMN emoji text DEFAULT '👶';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'pin_hash'
  ) THEN
    -- Add pin_hash column if it doesn't exist
    ALTER TABLE children ADD COLUMN pin_hash text;
  END IF;
END $$;

-- Update existing data if needed
UPDATE children 
SET name = COALESCE(name, 'Enfant')
WHERE name IS NULL;

UPDATE children 
SET emoji = COALESCE(emoji, '👶')
WHERE emoji IS NULL;

-- Make required columns NOT NULL after ensuring they have values
ALTER TABLE children 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN emoji SET NOT NULL,
ALTER COLUMN pin_hash SET NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Update policies to work with the correct structure
DROP POLICY IF EXISTS "Children can manage their own history" ON children;
DROP POLICY IF EXISTS "Parents can read their children's history" ON children;
DROP POLICY IF EXISTS "Allow anonymous child login verification" ON children;
DROP POLICY IF EXISTS "Parents can create children" ON children;
DROP POLICY IF EXISTS "Parents can delete their own children" ON children;
DROP POLICY IF EXISTS "Parents can read their own children" ON children;
DROP POLICY IF EXISTS "Parents can update their own children" ON children;

-- Create updated policies
CREATE POLICY "Parents can manage their children"
  ON children
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Allow child login verification"
  ON children
  FOR SELECT
  TO anon
  USING (true);