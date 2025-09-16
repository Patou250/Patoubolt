export const handler = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI // ex: https://patou.app/parent/callback
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state'
  ].join(' ')
  if (!clientId || !redirectUri) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Env SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI missing' }) }
  }
  const state = Math.random().toString(36).slice(2)
  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('state', state)
  return { statusCode: 302, headers: { Location: url.toString() } }
}