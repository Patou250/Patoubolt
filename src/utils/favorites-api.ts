import { supabase } from '../lib/supabase'
import type { Favorite, PlayHistory, TrackInfo, PlayInsights } from '../types/favorites'

// Use Supabase edge functions for API calls
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL

export class FavoritesApi {
  // Toggle favorite (optimistic UI)
  static async toggleFavorite(childId: string, trackId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/functions/v1/favorites-toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          childId,
          trackId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }

      const data = await response.json()
      return data.favorited
    } catch (error) {
      console.error('Toggle favorite error:', error)
      throw error
    }
  }

  // Get child's favorites
  static async getFavorites(childId: string): Promise<Favorite[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get favorites error:', error)
      throw error
    }
  }

  // Check if track is favorited
  static async isFavorited(childId: string, trackId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('child_id', childId)
        .eq('track_id', trackId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Check favorite error:', error)
      return false
    }
  }

  // Record play event
  static async recordPlayEvent(
    childId: string,
    trackId: string,
    event: 'start' | 'tick' | 'end',
    options: {
      playlistId?: string
      explicit?: boolean
      sessionId?: string
    } = {}
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/functions/v1/play-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          childId,
          trackId,
          event,
          playlistId: options.playlistId,
          explicit: options.explicit
        })
      })

      if (!response.ok) {
        console.warn('Failed to record play event:', response.status)
      }
    } catch (error) {
      // Fire-and-forget: don't throw errors to avoid blocking playback
      console.warn('Record play event error:', error)
    }
  }

  // Get play history
  static async getPlayHistory(childId: string, limit: number = 50): Promise<PlayHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/functions/v1/play-history?childId=${childId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch play history')
      }

      const data = await response.json()
      return data.history || []
    } catch (error) {
      console.error('Get play history error:', error)
      throw error
    }
  }

  // Get play insights for parent dashboard
  static async getPlayInsights(childId?: string): Promise<PlayInsights> {
    try {
      let query = supabase
        .from('play_history')
        .select('*')

      if (childId) {
        query = query.eq('child_id', childId)
      }

      const { data: history, error } = await query
        .order('started_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      const plays = history || []
      const totalPlays = plays.length
      const totalDurationMinutes = Math.floor(
        plays.reduce((sum, play) => sum + play.duration_sec, 0) / 60
      )

      // Top tracks
      const trackStats = new Map<string, { count: number; duration: number }>()
      plays.forEach(play => {
        const existing = trackStats.get(play.track_id) || { count: 0, duration: 0 }
        trackStats.set(play.track_id, {
          count: existing.count + 1,
          duration: existing.duration + play.duration_sec
        })
      })

      const topTracks = Array.from(trackStats.entries())
        .map(([trackId, stats]) => ({
          track_id: trackId,
          play_count: stats.count,
          total_duration_minutes: Math.floor(stats.duration / 60)
        }))
        .sort((a, b) => b.play_count - a.play_count)
        .slice(0, 10)

      // Top artists (would need track info from Spotify API)
      const topArtists: any[] = []

      // Recent plays
      const recentPlays = plays.slice(0, 20)

      // Explicit content ratio
      const explicitPlays = plays.filter(play => play.explicit).length
      const explicitContentRatio = totalPlays > 0 ? explicitPlays / totalPlays : 0

      return {
        total_plays: totalPlays,
        total_duration_minutes: totalDurationMinutes,
        top_tracks: topTracks,
        top_artists: topArtists,
        recent_plays: recentPlays,
        explicit_content_ratio: explicitContentRatio
      }
    } catch (error) {
      console.error('Get play insights error:', error)
      throw error
    }
  }
}