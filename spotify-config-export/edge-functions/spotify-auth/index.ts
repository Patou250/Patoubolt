import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const SPOTIFY_REDIRECT_URI = Deno.env.get('SPOTIFY_REDIRECT_URI') || 'https://patou.app/parent/callback';

serve(async (req) => {
  console.log('🔍 Spotify auth request:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'login';
    
    console.log('🎯 Action demandée:', action)
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error('Spotify credentials not configured')
    }

    // Validate admin token for admin actions
    const adminToken = req.headers.get('x-admin-token');
    const isAdminAction = action === 'start' || action === 'admin_callback';
    
    if (isAdminAction && (!adminToken || adminToken !== Deno.env.get('ADMIN_TOKEN'))) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Invalid admin token' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'login': {
        // Déterminer l'URI de redirection basée sur l'origine
        const origin = req.headers.get('origin') || 'https://patou.app'
        const finalRedirectUri = `${origin}/parent/callback`
        
        console.log('🔗 Redirect URI:', finalRedirectUri)
        
        const scopes = [
          'user-read-private',
          'user-read-email',
          'playlist-read-private',
          'playlist-read-collaborative',
          'user-library-read',
          'streaming',
          'user-read-playback-state',
          'user-modify-playback-state'
        ].join(' ');

        const state = crypto.randomUUID();
        
        console.log('🎲 State généré:', state)
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
          `client_id=${SPOTIFY_CLIENT_ID}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(finalRedirectUri)}&` +
          `scope=${encodeURIComponent(scopes)}&` +
          `state=${state}&` +
          `show_dialog=true`;
        
        console.log('✅ URL générée:', authUrl)

        return new Response(
          JSON.stringify({ 
            authorize_url: authUrl,
            state,
            redirect_uri: finalRedirectUri
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'callback': {
        const body = await req.json();
        const { code, state } = body;
        
        console.log('🔄 Callback reçu:', { hasCode: !!code, hasState: !!state })
        
        if (!code) {
          throw new Error('Authorization code is required');
        }

        // Utiliser la même logique que login pour l'URI
        const origin = req.headers.get('origin') || 'https://patou.app'
        const finalRedirectUri = `${origin}/parent/callback`
        
        console.log('🔗 Callback redirect URI:', finalRedirectUri)

        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: finalRedirectUri
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ Erreur token exchange:', errorText)
          throw new Error(`Spotify token exchange failed: ${tokenResponse.status} ${errorText}`);
        }

        const tokens = await tokenResponse.json();
        console.log('✅ Tokens reçus')

        // Get user profile
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const user = await userResponse.json();
        console.log('✅ Profil utilisateur récupéré')

        return new Response(
          JSON.stringify({
            success: true,
            tokens: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_in: tokens.expires_in,
              token_type: tokens.token_type,
              scope: tokens.scope
            },
            user: {
              id: user.id,
              email: user.email,
              display_name: user.display_name
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'start': {
        // Admin action to start Spotify OAuth flow
        const scopes = [
          'playlist-modify-public',
          'playlist-modify-private',
          'user-read-private'
        ].join(' ');

        const state = crypto.randomUUID();
        const adminRedirectUri = `${SPOTIFY_REDIRECT_URI}?admin=true`;
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
          `client_id=${SPOTIFY_CLIENT_ID}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(adminRedirectUri)}&` +
          `scope=${encodeURIComponent(scopes)}&` +
          `state=${state}&` +
          `show_dialog=true`;

        return new Response(
          JSON.stringify({ 
            authorize_url: authUrl,
            state 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Spotify auth error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});