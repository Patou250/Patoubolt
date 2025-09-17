import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  // Headers CORS pour toutes les réponses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Gestion OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    }
  }

  try {
    console.log('🚀 Fonction spotify-auth-start appelée')
    console.log('📝 Method:', event.httpMethod)
    console.log('📝 Path:', event.path)
    console.log('📝 Query:', event.queryStringParameters)
    
    // Récupération des variables d'environnement avec fallbacks
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID
    const redirectUri = process.env.VITE_REDIRECT_URI || process.env.SPOTIFY_REDIRECT_URI || 'https://patou.app/parent/callback'
    
    console.log('🔧 Client ID présent:', !!clientId)
    console.log('🔧 Client ID value:', clientId ? `${clientId.substring(0, 8)}...` : 'MISSING')
    console.log('🔧 Redirect URI:', redirectUri)
    console.log('🔧 All env vars:', Object.keys(process.env).filter(k => k.includes('SPOTIFY')))
    
    if (!clientId) {
      console.error('❌ SPOTIFY_CLIENT_ID manquant dans les variables d\'environnement')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'SPOTIFY_CLIENT_ID not configured',
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('SPOTIFY'))
        })
      }
    }

    // Scopes Spotify
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    // Génération du state pour la sécurité
    const state = Math.random().toString(36).substring(7)
    console.log('🎲 State généré:', state)
    
    // Construction de l'URL d'autorisation Spotify
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true',
      state: state
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log('🔗 URL d\'autorisation générée:', authUrl)

    // Redirection avec cookie de state
    return {
      statusCode: 302,
      headers: {
        'Location': authUrl,
        'Set-Cookie': `spotify_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  } catch (error) {
    console.error('❌ Erreur dans spotify-auth-start:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
}