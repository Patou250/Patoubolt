interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  explicit: boolean
  popularity: number
  duration_ms: number
  album: {
    name: string
    images: { url: string }[]
  }
}

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

class SpotifyClient {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Missing Spotify credentials')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.status}`)
    }

    const data: SpotifyTokenResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer

    return this.accessToken
  }

  async getTrack(id: string): Promise<SpotifyTrack> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.status}`)
    }

    return response.json()
  }
}

export const spotifyClient = new SpotifyClient()
export const getTrack = (id: string) => spotifyClient.getTrack(id)