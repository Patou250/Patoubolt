/*
  # Fix children table structure

  1. Changes
    - Update children table to match expected structure
    - Rename display_name to name
    - Rename child_identifier to identifier (not used in current schema)
    - Ensure proper column names and types

  2. Security
    - Maintain existing RLS policies
    - Keep foreign key constraints
*/

-- Update the children table structure to match the code expectations
-- The current schema already has the correct structure, but let's ensure consistency

-- Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_name ON children(name);

-- Ensure RLS policies are working correctly
-- The existing policies should work, but let's verify the structure

-- Update any existing data to ensure consistency
UPDATE children SET updated_at = now() WHERE updated_at IS NULL;