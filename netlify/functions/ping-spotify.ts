import { Handler } from '@netlify/functions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  try {
    // Vérifier si on a des tokens Spotify en cookie
    const cookies = event.headers.cookie || ''
    const hasSpotifyTokens = cookies.includes('spotify_access_token') || 
                            cookies.includes('spotify_refresh_token')

    let connected = false
    let scopesOk = false

    if (hasSpotifyTokens) {
      // Extraire le token d'accès du cookie (simplifié)
      const accessTokenMatch = cookies.match(/spotify_access_token=([^;]+)/)
      const accessToken = accessTokenMatch ? accessTokenMatch[1] : null

      if (accessToken) {
        try {
          // Test simple de l'API Spotify pour vérifier la connexion
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })

          connected = response.ok

          if (connected) {
            // Vérifier les scopes en testant quelques endpoints
            const playlistResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=1', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })

            const playerResponse = await fetch('https://api.spotify.com/v1/me/player', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })

            // Si on peut accéder aux playlists et au player, les scopes sont OK
            scopesOk = playlistResponse.ok && (playerResponse.ok || playerResponse.status === 204)
          }
        } catch (error) {
          console.error('Spotify API test failed:', error)
          connected = false
          scopesOk = false
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connected,
        scopesOk
      }),
    }
  } catch (error) {
    console.error('Ping Spotify error:', error)
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connected: false,
        scopesOk: false
      }),
    }
  }
}