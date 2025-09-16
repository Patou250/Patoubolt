export interface Favorite {
  id: string
  child_id: string
  track_id: string
  created_at: string
}

export interface PlayHistory {
  id: string
  child_id: string
  track_id: string
  playlist_id?: string
  started_at: string
  ended_at?: string
  duration_sec: number
  intent: 'play' | 'skip'
  explicit: boolean
}

export interface TrackInfo {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  explicit: boolean
  duration_ms: number
}

export interface PlayHistoryWithTrack extends PlayHistory {
  track_info?: TrackInfo
}

export interface FavoriteWithTrack extends Favorite {
  track_info?: TrackInfo
}

export interface PlayInsights {
  total_plays: number
  total_duration_minutes: number
  top_tracks: Array<{
    track_id: string
    track_info?: TrackInfo
    play_count: number
    total_duration_minutes: number
  }>
  top_artists: Array<{
    artist_name: string
    play_count: number
    total_duration_minutes: number
  }>
  recent_plays: PlayHistoryWithTrack[]
  explicit_content_ratio: number
}