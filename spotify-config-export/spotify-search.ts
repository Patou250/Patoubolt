import { getSpotifyTokens } from './spotify-tokens'

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  explicit: boolean
  preview_url: string | null
  popularity: number
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
    limit: number
    offset: number
  }
}

export class SpotifySearchService {
  private async getValidToken(): Promise<string> {
    const tokens = getSpotifyTokens()
    if (!tokens) {
      throw new Error('No Spotify tokens available')
    }
    return tokens.access_token
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      console.log('🔍 Searching Spotify for:', query)
      
      const token = await this.getValidToken()
      
      const url = new URL('https://api.spotify.com/v1/search')
      url.searchParams.set('q', query)
      url.searchParams.set('type', 'track')
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('market', 'FR') // French market for better results

      console.log('📡 Making Spotify API request:', url.toString())

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Spotify API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Token expired or invalid')
          throw new Error('Token Spotify expiré')
        }
        const errorText = await response.text()
        console.error('❌ Spotify API error:', errorText)
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const data: SpotifySearchResponse = await response.json()
      console.log('✅ Search results:', data.tracks.items.length, 'tracks found')

      return data.tracks.items
    } catch (error) {
      console.error('❌ Search error:', error)
      throw error
    }
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    try {
      console.log('🎵 Getting track details for:', trackId)
      
      const token = await this.getValidToken()

      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get track: ${response.status}`)
      }

      const track = await response.json()
      console.log('✅ Track details retrieved:', track.name)

      return track
    } catch (error) {
      console.error('❌ Error getting track:', error)
      throw error
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      console.log('👤 Getting user profile...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.status}`)
      }

      const profile = await response.json()
      console.log('✅ User profile retrieved:', profile.display_name)

      return profile
    } catch (error) {
      console.error('❌ Error getting user profile:', error)
      throw error
    }
  }
}

// Export singleton instance
export const spotifySearch = new SpotifySearchService()