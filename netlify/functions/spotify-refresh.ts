import fetch from 'node-fetch'

const ORIGIN = 'https://patou.app'
const baseHeaders = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
}

const parseCookies = (hdr?: string) =>
  (hdr || '').split(';').reduce((acc: any, c) => {
    const i = c.indexOf('=')
    if (i === -1) return acc
    const k = c.slice(0, i).trim()
    const v = decodeURIComponent(c.slice(i+1).trim())
    acc[k] = v
    return acc
  }, {})

export const handler = async (event: any) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: { ...baseHeaders, 'Access-Control-Allow-Headers': 'Content-Type' } }
    }

    const cookies = parseCookies(event.headers?.cookie)
    const refresh = cookies['patou_rt']
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!refresh) {
      return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'No refresh cookie' }) }
    }
    if (!clientId || !clientSecret) {
      return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: 'Missing env' }) }
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh })
    })
    const data = await res.json()
    if (!res.ok) {
      // renvoie l'erreur spotify lisible, pas un 502
      return { statusCode: res.status, headers: baseHeaders, body: JSON.stringify({ error: data }) }
    }
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ access_token: data.access_token }) }
  } catch (e: any) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: e?.message || 'unknown' }) }
  }
}