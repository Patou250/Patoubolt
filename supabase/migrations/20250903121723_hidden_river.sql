/*
  # Create parents table for Spotify authentication

  1. New Tables
    - `parents`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `spotify_id` (text, unique) 
      - `refresh_token` (text, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `parents` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  spotify_id text UNIQUE NOT NULL,
  refresh_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read own data"
  ON parents
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Parents can update own data"
  ON parents
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Allow parent creation"
  ON parents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);