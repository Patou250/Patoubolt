import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  console.log('🚀 Fonction spotify-auth-start appelée')
  console.log('📝 Method:', event.httpMethod)
  console.log('📝 Headers:', event.headers)
  
  try {
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = process.env.VITE_REDIRECT_URI || 'https://patou.app/parent/callback'
    
    console.log('🔧 Client ID présent:', !!clientId)
    console.log('🔧 Redirect URI:', redirectUri)
    
    if (!clientId) {
      console.error('❌ SPOTIFY_CLIENT_ID manquant')
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'SPOTIFY_CLIENT_ID not configured' })
      }
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-library-modify',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    const state = Math.random().toString(36).substring(7)
    console.log('🎲 State généré:', state)
    
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('show_dialog', 'true')
    authUrl.searchParams.set('state', state)

    const finalUrl = authUrl.toString()
    console.log('🔗 URL d\'autorisation générée:', finalUrl)

    return {
      statusCode: 302,
      headers: {
        'Location': finalUrl,
        'Set-Cookie': `spotify_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        'Cache-Control': 'no-cache'
      }
    }
  } catch (error) {
    console.error('❌ Erreur dans spotify-auth-start:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}