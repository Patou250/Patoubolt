export async function handler(event, context) {
  const { httpMethod, path } = event;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.VITE_REDIRECT_URI || `${process.env.URL}/parent/callback`;
    
    if (!clientId) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Spotify client ID not configured' })
      };
    }

    // Handle /start route
    if (path.includes('/start')) {
      const scopes = [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state'
      ].join(' ');

      const state = Math.random().toString(36).substring(7);
      
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `show_dialog=true&` +
        `state=${state}`;

      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl,
          'Set-Cookie': `spotify_state=${state}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=600`
        },
        body: ''
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Spotify auth error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}