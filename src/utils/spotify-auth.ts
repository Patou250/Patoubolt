// Spotify OAuth authentication utilities
import { setSpotifyTokens, clearSpotifyTokens } from './spotify-tokens'

// Get the correct API base URL based on environment
function getApiBaseUrl(): string {
  // In production (deployed), use relative URLs
  if (import.meta.env.PROD) {
    return ''
  }
  // In development, use localhost
  return 'http://localhost:3001'
}

export interface SpotifyAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export function buildAuthUrl(config: SpotifyAuthConfig): string {
  console.log('🔗 Construction de l\'URL d\'authentification...')
  console.log('🔧 Configuration:', {
    hasClientId: !!config.clientId,
    redirectUri: config.redirectUri,
    scopesCount: config.scopes.length
  })

  const state = Math.random().toString(36).substring(7)
  localStorage.setItem('spotify_auth_state', state)

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    show_dialog: 'true',
    state: state
  })

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
  console.log('🔗 URL générée:', authUrl)
  
  return authUrl
}

export async function exchangeCodeForTokens(
  code: string, 
  state: string,
  config: SpotifyAuthConfig
): Promise<void> {
  console.log('🔄 Échange du code pour les tokens...')
  console.log('🔧 Paramètres:', {
    hasCode: !!code,
    hasState: !!state,
    hasClientId: !!config.clientId,
    hasClientSecret: !!config.clientSecret
  })

  // Verify state
  const storedState = localStorage.getItem('spotify_auth_state')
  if (state !== storedState) {
    console.error('❌ State mismatch:', { received: state, stored: storedState })
    throw new Error('Invalid state parameter')
  }

  console.log('✅ State vérifié')
  localStorage.removeItem('spotify_auth_state')

  // Exchange code for tokens
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })

  console.log('🌐 Requête vers Spotify API...')
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenParams.toString()
  })

  console.log('📡 Réponse Spotify:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Erreur Spotify API:', errorText)
    console.error('❌ Headers de réponse:', Object.fromEntries(response.headers.entries()))
    throw new Error(`Spotify API error: ${response.status} ${response.statusText}`)
  }

  const tokens = await response.json()
  console.log('🔍 Tokens reçus (masqués):', {
    access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'MANQUANT',
    refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'MANQUANT',
    expires_in: tokens.expires_in,
    token_type: tokens.token_type
  })

  // Save tokens
  console.log('💾 Sauvegarde des tokens...')
  setSpotifyTokens(tokens)
  console.log('✅ Tokens sauvegardés')
}

export function clearTokens(): void {
  console.log('🧹 Nettoyage de tous les tokens')
  clearSpotifyTokens()
  localStorage.removeItem('spotify_auth_state')
}

export function getStoredTokens() {
  return getSpotifyTokens()
}

// Import the function from spotify-tokens
import { getSpotifyTokens } from './spotify-tokens'