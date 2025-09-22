import { getSpotifyTokens } from './spotify-tokens'

interface SpotifyDevice {
  id: string
  is_active: boolean
  is_private_session: boolean
  is_restricted: boolean
  name: string
  type: string
  volume_percent: number
}

interface SpotifyPlaybackState {
  device: SpotifyDevice
  repeat_state: string
  shuffle_state: boolean
  context: any
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: SpotifyTrack | null
}

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
}

export class SpotifyPlayerService {
  private async getValidToken(): Promise<string> {
    const tokens = getSpotifyTokens()
    if (!tokens) {
      throw new Error('No Spotify tokens available')
    }
    return tokens.access_token
  }

  async getDevices(): Promise<SpotifyDevice[]> {
    try {
      console.log('📱 Getting available devices...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Devices found:', data.devices?.length || 0)

      return data.devices || []
    } catch (error) {
      console.error('❌ Error getting devices:', error)
      throw error
    }
  }

  async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    try {
      console.log('🎵 Getting current playback state...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 204) {
        console.log('📱 No active device')
        return null
      }

      if (!response.ok) {
        throw new Error(`Failed to get playback state: ${response.status}`)
      }

      const state = await response.json()
      console.log('✅ Playback state retrieved:', state.is_playing ? 'playing' : 'paused')

      return state
    } catch (error) {
      console.error('❌ Error getting playback state:', error)
      throw error
    }
  }

  async playTrack(trackId: string, deviceId?: string): Promise<void> {
    try {
      console.log('▶️ Playing track:', trackId, 'on device:', deviceId)
      
      const token = await this.getValidToken()

      const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play'

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Aucun appareil Spotify actif trouvé')
        }
        const errorText = await response.text()
        console.error('❌ Play error:', errorText)
        throw new Error(`Erreur de lecture: ${response.status}`)
      }

      console.log('✅ Track started successfully')
    } catch (error) {
      console.error('❌ Error playing track:', error)
      throw error
    }
  }

  async playPlaylist(playlistId: string, deviceId?: string): Promise<void> {
    try {
      console.log('▶️ Playing playlist:', playlistId)
      
      const token = await this.getValidToken()

      const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play'

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Aucun appareil Spotify actif trouvé')
        }
        throw new Error(`Erreur de lecture: ${response.status}`)
      }

      console.log('✅ Playlist started successfully')
    } catch (error) {
      console.error('❌ Error playing playlist:', error)
      throw error
    }
  }

  async pausePlayback(): Promise<void> {
    try {
      console.log('⏸️ Pausing playback...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to pause: ${response.status}`)
      }

      console.log('✅ Playback paused')
    } catch (error) {
      console.error('❌ Error pausing:', error)
      throw error
    }
  }

  async resumePlayback(): Promise<void> {
    try {
      console.log('▶️ Resuming playback...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to resume: ${response.status}`)
      }

      console.log('✅ Playback resumed')
    } catch (error) {
      console.error('❌ Error resuming:', error)
      throw error
    }
  }

  async nextTrack(): Promise<void> {
    try {
      console.log('⏭️ Skipping to next track...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to skip: ${response.status}`)
      }

      console.log('✅ Skipped to next track')
    } catch (error) {
      console.error('❌ Error skipping:', error)
      throw error
    }
  }

  async previousTrack(): Promise<void> {
    try {
      console.log('⏮️ Going to previous track...')
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to go back: ${response.status}`)
      }

      console.log('✅ Went to previous track')
    } catch (error) {
      console.error('❌ Error going back:', error)
      throw error
    }
  }

  async setVolume(volumePercent: number): Promise<void> {
    try {
      console.log('🔊 Setting volume to:', volumePercent)
      
      const token = await this.getValidToken()

      const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to set volume: ${response.status}`)
      }

      console.log('✅ Volume set successfully')
    } catch (error) {
      console.error('❌ Error setting volume:', error)
      throw error
    }
  }

  async transferPlayback(deviceId: string, play: boolean = false): Promise<void> {
    try {
      console.log('📱 Transferring playback to device:', deviceId)
      
      const token = await this.getValidToken()

      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play
        })
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to transfer playback: ${response.status}`)
      }

      console.log('✅ Playback transferred successfully')
    } catch (error) {
      console.error('❌ Error transferring playback:', error)
      throw error
    }
  }
}

// Export singleton instance
export const spotifyPlayer = new SpotifyPlayerService()