// Secure Spotify API client that uses only client-side calls

interface SpotifyApiOptions {
  isChild?: boolean
}

class SpotifyApi {
  private isChild: boolean

  constructor(options: SpotifyApiOptions = {}) {
    this.isChild = options.isChild || false
  }

  private getAccessToken(): string | null {
    const tokens = this.getSpotifyTokens()
    return tokens?.access_token || null
  }

  private getSpotifyTokens() {
    try {
      const stored = localStorage.getItem('spotify_tokens')
      if (!stored) return null
      
      const tokens = JSON.parse(stored)
      if (tokens.expires_at < Date.now()) {
        localStorage.removeItem('spotify_tokens')
        return null
      }
      
      return tokens
    } catch {
      return null
    }
  }

  private getParentSession() {
    const sessionData = localStorage.getItem('patou_parent_session')
    if (!sessionData) return null
    
    try {
      const session = JSON.parse(sessionData)
      // Check if session is less than 1 hour old
      if (Date.now() - session.timestamp > 3600000) {
        localStorage.removeItem('patou_parent_session')
        return null
      }
      return session
    } catch {
      localStorage.removeItem('patou_parent_session')
      return null
    }
  }

  // Direct Spotify Web API calls with token from localStorage
  async getTrack(trackId: string): Promise<any> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to get track info')
    }
    
    return response.json()
  }

  async getUserPlaylists(): Promise<any> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')
    
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to get playlists')
    }
    
    return response.json()
  }

  async getPlaybackState(): Promise<any> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')
    
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.status === 204) {
      return null // No active device
    }
    
    if (!response.ok) {
      throw new Error('Failed to get playback state')
    }
    
    return response.json()
  }

  async play(deviceId: string, trackId?: string, context?: string): Promise<void> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')

    const body: any = {}
    if (trackId) {
      body.uris = [`spotify:track:${trackId}`]
    }
    if (context) {
      body.context_uri = context
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error('Failed to play')
    }
  }

  async pause(): Promise<void> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')

    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to pause')
    }
  }

  async next(): Promise<void> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')

    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to skip to next track')
    }
  }

  async previous(): Promise<void> {
    const token = this.getAccessToken()
    if (!token) throw new Error('No access token available')

    const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to go to previous track')
    }
  }
}

export default SpotifyApi