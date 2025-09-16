import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  try {
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = process.env.VITE_REDIRECT_URI || 'https://patou.app/parent/callback'
    
    if (!clientId) {
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
    
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('show_dialog', 'true')
    authUrl.searchParams.set('state', state)

    return {
      statusCode: 302,
      headers: {
        'Location': authUrl.toString(),
        'Set-Cookie': `spotify_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
      }
    }
  } catch (error) {
    console.error('Spotify auth start error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}