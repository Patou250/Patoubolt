export interface TimeWindow {
  dow: number[] // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  start: string // "HH:MM" format
  end: string   // "HH:MM" format
}

export interface ChildRules {
  id: string
  child_id: string
  time_windows: TimeWindow[]
  daily_quota_minutes: number
  explicit_block: boolean
  whitelist_track_ids: string[]
  whitelist_playlist_ids: string[]
  created_at: string
  updated_at: string
}

export interface ChildUsage {
  id: string
  child_id: string
  usage_date: string // YYYY-MM-DD format
  minutes_listened: number
  last_updated: string
}

export interface RuleViolation {
  type: 'time_window' | 'quota_exceeded' | 'explicit_content' | 'not_whitelisted'
  message: string
  details?: any
}

export interface UsageUpdate {
  child_id: string
  seconds_played: number
  track_id?: string
  timestamp: string
}