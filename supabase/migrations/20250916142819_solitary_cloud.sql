/*
  # Create spotify_tokens table

  1. New Tables
    - `spotify_tokens`
      - `parent_id` (uuid, primary key, foreign key to parents)
      - `access_token` (text, nullable for refresh scenarios)
      - `refresh_token` (text, not null)
      - `expires_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on `spotify_tokens` table
    - Add policy for parents to manage their own tokens

  3. Purpose
    - Store Spotify OAuth tokens securely
    - Link tokens to parent accounts
    - Handle token expiration and refresh
*/

CREATE TABLE IF NOT EXISTS spotify_tokens (
  parent_id uuid PRIMARY KEY REFERENCES parents(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their own Spotify tokens"
  ON spotify_tokens
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_parent ON spotify_tokens(parent_id);
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_expires ON spotify_tokens(expires_at);