// Utility functions for managing Spotify tokens
export interface SpotifyTokens {
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
    console.log('🔍 Tokens bruts dans localStorage:', stored)
    
    if (!stored) {
      console.log('❌ Aucun token trouvé')
      return null
    }

    const tokens = JSON.parse(stored) as SpotifyTokens
    console.log('📦 Tokens parsés:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: tokens.expires_at,
      isExpired: tokens.expires_at < Date.now()
    })

    // Check if tokens are expired
    if (tokens.expires_at < Date.now()) {
      console.log('⏰ Tokens expirés')
      clearSpotifyTokens()
      return null
    }

    console.log('✅ Tokens valides trouvés')
    return tokens
  } catch (error) {
    console.error('❌ Erreur parsing tokens:', error)
    clearSpotifyTokens()
    return null
  }
}

export function setSpotifyTokens(tokens: Omit<SpotifyTokens, 'expires_at'>): void {
  try {
    console.log('💾 Sauvegarde des tokens Spotify...')
    
    const tokensWithExpiry: SpotifyTokens = {
      ...tokens,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    }

    console.log('🔧 Tokens à sauvegarder:', {
      hasAccessToken: !!tokensWithExpiry.access_token,
      hasRefreshToken: !!tokensWithExpiry.refresh_token,
      expiresIn: tokens.expires_in,
      expiresAt: new Date(tokensWithExpiry.expires_at).toISOString()
    })

    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokensWithExpiry))
    
    // Vérification immédiate
    const verification = localStorage.getItem(TOKENS_KEY)
    console.log('✅ Vérification sauvegarde:', !!verification)
    
    if (!verification) {
      throw new Error('localStorage.setItem a échoué silencieusement')
    }
  } catch (error) {
    console.error('❌ Erreur sauvegarde tokens:', error)
    throw error
  }
}

export function clearSpotifyTokens(): void {
  console.log('🧹 Nettoyage des tokens Spotify')
  localStorage.removeItem(TOKENS_KEY)
}

export function isTokenValid(): boolean {
  const tokens = getSpotifyTokens()
  const isValid = tokens !== null
  console.log('🎯 Tokens valides?', isValid)
  return isValid
}