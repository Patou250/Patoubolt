import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      }
    }
  }

  try {
    const cookies = event.headers.cookie || ''
    const refreshToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('spotify_refresh_token='))
      ?.split('=')[1]

    if (!refreshToken) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'No refresh token found' })
      }
    }

    const clientId = 'dc55e43e7ed24d1fa603a216e56bb4e9'
    const clientSecret = '5d4ec03936134187ad7e59f1d1526f76'

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Spotify credentials not configured' })
      }
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Spotify token refresh failed:', errorData)
      return {
        statusCode: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Token refresh failed' })
      }
    }

    const tokens = await tokenResponse.json()

    // Update refresh token if provided
    let setCookieHeader = ''
    if (tokens.refresh_token) {
      setCookieHeader = `spotify_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 60}` // 60 days
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...(setCookieHeader && { 'Set-Cookie': setCookieHeader })
      },
      body: JSON.stringify({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type
      })
    }
  } catch (error) {
    console.error('Spotify refresh error:', error)
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