export const handler = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || process.env.VITE_REDIRECT_URI || 'https://patou.app/parent/callback'
  
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ')

  if (!clientId) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'SPOTIFY_CLIENT_ID not configured',
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('SPOTIFY') || key.includes('VITE'))
      }) 
    }
  }

  const state = Math.random().toString(36).slice(2)
  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('state', state)
  url.searchParams.set('show_dialog', 'true')

  return { 
    statusCode: 302, 
    headers: { 
      Location: url.toString(),
      'Set-Cookie': `spotify_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=600`
    } 
  }
}