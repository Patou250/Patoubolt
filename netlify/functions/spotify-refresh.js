export async function handler(event, context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // Parse cookies
    const cookies = event.headers.cookie || '';
    const cookieObj = {};
    cookies.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) cookieObj[key] = value;
    });

    const accessToken = cookieObj.spotify_access_token;
    const refreshToken = cookieObj.spotify_refresh_token;

    // If we have a valid access token, return it
    if (accessToken) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ access_token: accessToken })
      };
    }

    // If no access token but we have refresh token, refresh it
    if (refreshToken) {
      const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Spotify credentials not configured' })
        };
      }

      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!refreshResponse.ok) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Token refresh failed' })
        };
      }

      const tokens = await refreshResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Set-Cookie': `spotify_access_token=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
        },
        body: JSON.stringify({ access_token: tokens.access_token })
      };
    }

    // No tokens available
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'No authentication tokens available' })
    };

  } catch (error) {
    console.error('Refresh error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}