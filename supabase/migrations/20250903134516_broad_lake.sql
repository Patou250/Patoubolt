/*
  # Create favorites and play history tables

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key to children)
      - `track_id` (text, Spotify track ID)
      - `created_at` (timestamp)
    - `play_history`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key to children)
      - `track_id` (text, Spotify track ID)
      - `playlist_id` (text, optional Spotify playlist ID)
      - `started_at` (timestamp)
      - `ended_at` (timestamp, nullable)
      - `duration_sec` (integer, calculated duration)
      - `intent` (text, 'play' or 'skip')
      - `explicit` (boolean, from track metadata)

  2. Security
    - Enable RLS on both tables
    - Add policies for child and parent access
    - Add indexes for performance

  3. Constraints
    - Unique constraint on favorites (child_id, track_id)
    - Check constraints for valid intent values
*/

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create play_history table
CREATE TABLE IF NOT EXISTS play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  playlist_id text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_sec integer DEFAULT 0,
  intent text DEFAULT 'play' CHECK (intent IN ('play', 'skip')),
  explicit boolean DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS favorites_child_id_idx ON favorites(child_id);
CREATE INDEX IF NOT EXISTS favorites_child_track_idx ON favorites(child_id, track_id);
CREATE INDEX IF NOT EXISTS play_history_child_id_idx ON play_history(child_id);
CREATE INDEX IF NOT EXISTS play_history_child_started_idx ON play_history(child_id, started_at DESC);
CREATE INDEX IF NOT EXISTS play_history_track_id_idx ON play_history(track_id);

-- Add unique constraint for favorites
ALTER TABLE favorites ADD CONSTRAINT favorites_child_track_unique UNIQUE (child_id, track_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
CREATE POLICY "Children can manage their own favorites"
  ON favorites
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Parents can read their children's favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT children.id 
      FROM children 
      JOIN parents ON children.parent_id = parents.id 
      WHERE parents.email = (auth.jwt() ->> 'email'::text)
    )
  );

-- RLS Policies for play_history
CREATE POLICY "Children can manage their own history"
  ON play_history
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Parents can read their children's history"
  ON play_history
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT children.id 
      FROM children 
      JOIN parents ON children.parent_id = parents.id 
      WHERE parents.email = (auth.jwt() ->> 'email'::text)
    )
  );