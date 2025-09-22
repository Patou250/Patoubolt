// Utility functions for managing Spotify tokens
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
    console.log('🔍 Checking Spotify tokens in localStorage:', !!stored)
    
    if (!stored) {
      console.log('❌ No Spotify tokens found')
      return null
    }

    const tokens = JSON.parse(stored) as SpotifyTokens
    console.log('📦 Parsed tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: tokens.expires_at,
      isExpired: tokens.expires_at < Date.now()
    })

    // Check if tokens are expired
    if (tokens.expires_at < Date.now()) {
      console.log('⏰ Tokens expired, clearing')
      clearSpotifyTokens()
      return null
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
      expires_at: Date.now() + (tokens.expires_in * 1000)
    }

    console.log('🔧 Tokens to save:', {
      hasAccessToken: !!tokensWithExpiry.access_token,
      hasRefreshToken: !!tokensWithExpiry.refresh_token,
      expiresIn: tokens.expires_in,
      expiresAt: new Date(tokensWithExpiry.expires_at).toISOString()
    })

    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokensWithExpiry))
    
    // Vérification immédiate
    const verification = localStorage.getItem(TOKENS_KEY)
    console.log('✅ Save verification:', !!verification)
    
    if (!verification) {
      throw new Error('localStorage.setItem failed silently')
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

function isTokenValid(): boolean {
  const tokens = getSpotifyTokens()
  const isValid = tokens !== null
  console.log('🎯 Tokens valides?', isValid)
  return isValid
}

// Fonction pour rafraîchir les tokens côté client
async function refreshSpotifyTokens(): Promise<boolean> {
  try {
    const tokens = getSpotifyTokens()
    if (!tokens || !tokens.refresh_token) {
      console.log('❌ Pas de refresh token disponible')
      return false
    }

    console.log('🔄 Rafraîchissement des tokens Spotify...')
    
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('❌ Configuration Spotify manquante')
      return false
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token
      })
    })

    if (!response.ok) {
      console.error('❌ Erreur lors du rafraîchissement:', response.status)
      clearSpotifyTokens()
      return false
    }

    const newTokens = await response.json()
    console.log('✅ Nouveaux tokens reçus')

    // Mettre à jour les tokens (garder l'ancien refresh_token si pas fourni)
    const updatedTokens = {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || tokens.refresh_token,
      expires_in: newTokens.expires_in,
      token_type: newTokens.token_type,
      scope: newTokens.scope || tokens.scope
    }

    setSpotifyTokens(updatedTokens)
    return true
  } catch (error) {
    console.error('❌ Erreur rafraîchissement tokens:', error)
    clearSpotifyTokens()
    return false
  }
}