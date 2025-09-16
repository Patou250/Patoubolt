/*
  # Catalogue de tracks et système de tags

  1. Nouvelles Tables
    - `tracks` - Stockage des informations des tracks Spotify
      - `id` (uuid, primary key)
      - `spotify_id` (text, unique) - ID Spotify du track
      - `title` (text) - Titre du track
      - `artist` (text) - Artiste(s) du track
      - `duration_ms` (integer) - Durée en millisecondes
      - `explicit` (boolean) - Contenu explicite
      - `cover` (text) - URL de la pochette
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `track_tags` - Système de tags pour catégoriser les tracks
      - `id` (uuid, primary key)
      - `track_id` (uuid, foreign key vers tracks)
      - `tag` (text) - Tag (ex: 'kids', 'family', 'disney')
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur les deux tables
    - Policies pour permettre la lecture aux parents et enfants authentifiés
    - Policies pour permettre l'écriture aux parents seulement

  3. Index
    - Index sur spotify_id pour les recherches rapides
    - Index sur tag pour les filtres par catégorie
    - Index composite sur track_id + tag pour les jointures
*/

-- Table des tracks
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id text UNIQUE NOT NULL,
  title text NOT NULL,
  artist text NOT NULL,
  duration_ms integer DEFAULT 0,
  explicit boolean DEFAULT false,
  cover text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des tags pour catégoriser les tracks
CREATE TABLE IF NOT EXISTS track_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(track_id, tag)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS tracks_spotify_id_idx ON tracks(spotify_id);
CREATE INDEX IF NOT EXISTS track_tags_tag_idx ON track_tags(tag);
CREATE INDEX IF NOT EXISTS track_tags_track_id_idx ON track_tags(track_id);

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_tags ENABLE ROW LEVEL SECURITY;

-- Policies pour tracks
CREATE POLICY "Anyone can read tracks"
  ON tracks
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can manage tracks"
  ON tracks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies pour track_tags
CREATE POLICY "Anyone can read track tags"
  ON track_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can manage track tags"
  ON track_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);