import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { code, state } = JSON.parse(event.body || '{}')
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.VITE_REDIRECT_URI || 'https://patou.app/parent/callback'

    if (!code || !clientId || !clientSecret) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      }
    }

    // Verify state (optional but recommended)
    const cookies = event.headers.cookie || ''
    const stateCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('spotify_auth_state='))
      ?.split('=')[1]

    if (state && stateCookie && state !== stateCookie) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid state parameter' })
      }
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Spotify token exchange failed:', errorData)
      return {
        statusCode: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Token exchange failed' })
      }
    }

    const tokens = await tokenResponse.json()

    // Set refresh token as httpOnly cookie
    const refreshTokenCookie = `spotify_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 60}` // 60 days

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Set-Cookie': refreshTokenCookie
      },
      body: JSON.stringify({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope
      })
    }
  } catch (error) {
    console.error('Spotify exchange error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}