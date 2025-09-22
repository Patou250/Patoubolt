interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
  expires_at: number
}

const TOKENS_KEY = 'spotify_tokens'

export function getSpotifyTokens(): SpotifyTokens | null {
  try {
    const stored = localStorage.getItem(TOKENS_KEY)
    console.log('🔍 Checking Spotify tokens:', !!stored)
    
    if (!stored) {
      console.log('❌ No tokens found')
      return null
    }

    const tokens = JSON.parse(stored) as SpotifyTokens
    console.log('📦 Tokens found:', {
      hasAccess: !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
      expiresAt: new Date(tokens.expires_at).toISOString(),
      isExpired: tokens.expires_at < Date.now()
    })

    // Check expiration
    if (tokens.expires_at && tokens.expires_at < Date.now()) {
      console.log('⏰ Tokens expired, attempting refresh...')
      return refreshTokens(tokens)
    }

    console.log('✅ Valid tokens found')
    return tokens
  } catch (error) {
    console.error('❌ Error parsing tokens:', error)
    clearSpotifyTokens()
    return null
  }
}

export function setSpotifyTokens(tokens: Omit<SpotifyTokens, 'expires_at'>): void {
  try {
    console.log('💾 Saving Spotify tokens...')
    
    const tokensWithExpiry: SpotifyTokens = {
      ...tokens,
      expires_at: Date.now() + (tokens.expires_in * 1000) - 60000 // 1 minute buffer
    }

    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokensWithExpiry))
    console.log('✅ Tokens saved successfully')
    
    // Verify save
    const verification = localStorage.getItem(TOKENS_KEY)
    if (!verification) {
      throw new Error('Failed to save tokens')
    }
  } catch (error) {
    console.error('❌ Error saving tokens:', error)
    throw error
  }
}

export function clearSpotifyTokens(): void {
  console.log('🧹 Clearing Spotify tokens')
  localStorage.removeItem(TOKENS_KEY)
}

export function isTokenValid(): boolean {
  const tokens = getSpotifyTokens()
  return tokens !== null
}

// Refresh expired tokens
async function refreshTokens(expiredTokens: SpotifyTokens): Promise<SpotifyTokens | null> {
  try {
    console.log('🔄 Refreshing expired tokens...')
    
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || import.meta.env.SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || import.meta.env.SPOTIFY_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing Spotify credentials for refresh')
      clearSpotifyTokens()
      return null
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: expiredTokens.refresh_token
      })
    })

    if (!response.ok) {
      console.error('❌ Token refresh failed:', response.status)
      clearSpotifyTokens()
      return null
    }

    const newTokens = await response.json()
    console.log('✅ Tokens refreshed successfully')

    // Update stored tokens
    const updatedTokens = {
      ...expiredTokens,
      access_token: newTokens.access_token,
      expires_in: newTokens.expires_in,
      expires_at: Date.now() + (newTokens.expires_in * 1000) - 60000
    }

    localStorage.setItem(TOKENS_KEY, JSON.stringify(updatedTokens))
    return updatedTokens

  } catch (error) {
    console.error('❌ Error refreshing tokens:', error)
    clearSpotifyTokens()
    return null
  }
}