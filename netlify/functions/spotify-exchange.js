import fetch from 'node-fetch'

const cookie = (name: string, value: string, maxAgeSec: number) =>
  `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`

export const handler = async (event: any) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
    const { code } = JSON.parse(event.body || '{}')
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI
    if (!code || !clientId || !clientSecret || !redirectUri) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing code or env' }) }
    }
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    })
    const data = await tokenRes.json()
    if (!tokenRes.ok) {
      return { statusCode: tokenRes.status, body: JSON.stringify({ error: data }) }
    }
    const refresh = data.refresh_token
    const access = data.access_token
    const expiresIn = data.expires_in || 3600

    const headers: any = { 'Content-Type': 'application/json' }
    if (refresh) headers['Set-Cookie'] = cookie('patou_rt', encodeURIComponent(refresh), 60 * 60 * 24 * 60) // 60j
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, hasRefresh: !!refresh, access }) }
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'unknown' }) }
  }
}