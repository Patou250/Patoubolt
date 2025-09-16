export interface Playlist {
  id: string
  title: string
  cover?: string
  source: 'patou' | 'spotify'
  source_id?: string
  active: boolean
  explicit_filtered: boolean
  created_at: string
  updated_at: string
}

export interface Track {
  id: string
  spotify_id: string
  title: string
  artist: string
  explicit: boolean
  duration_ms?: number
  cover?: string
  created_at: string
}

export interface PlaylistItem {
  id: string
  playlist_id: string
  track_id: string
  order_index: number
  created_at: string
  track?: Track
}

export interface ChildWhitelist {
  id: string
  child_id: string
  playlist_id?: string
  track_id?: string
  created_at: string
  playlist?: Playlist
  track?: Track
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  images: Array<{
    url: string
    height?: number
    width?: number
  }>
  tracks: {
    total: number
    items: Array<{
      track: SpotifyTrack
    }>
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    name: string
  }>
  explicit: boolean
  duration_ms: number
  album: {
    images: Array<{
      url: string
      height?: number
      width?: number
    }>
  }
}

export interface PatouPlaylistData {
  playlists: Array<{
    id: string
    title: string
    cover?: string
    description?: string
    tracks: Array<{
      spotify_id: string
      title: string
      artist: string
      explicit: boolean
      duration_ms: number
      cover?: string
    }>
  }>
}