import fetch from 'node-fetch'

const parseCookies = (hdr?: string) =>
  (hdr || '').split(';').reduce((acc: any, c) => {
    const [k, v] = c.trim().split('=')
    if (k) acc[k] = decodeURIComponent(v || '')
    return acc
  }, {})

export const handler = async (event: any) => {
  try {
    const cookies = parseCookies(event.headers?.cookie)
    const refresh = cookies['patou_rt']
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    if (!refresh) return { statusCode: 401, body: JSON.stringify({ error: 'No refresh cookie' }) }
    if (!clientId || !clientSecret) return { statusCode: 500, body: JSON.stringify({ error: 'Missing env' }) }

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh })
    })
    const data = await res.json()
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: data }) }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: data.access_token }) }
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'unknown' }) }
  }
}