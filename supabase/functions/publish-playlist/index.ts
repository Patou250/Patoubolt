import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { playlist_id } = await req.json()

    // Get playlist data
    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', playlist_id)
      .single()

    if (playlistError) {
      throw new Error(`Failed to fetch playlist: ${playlistError.message}`)
    }

    // Get playlist tracks
    const { data: playlistTracks, error: tracksError } = await supabaseAdmin
      .from('playlist_tracks')
      .select(`
        position,
        tracks (
          spotify_id,
          title,
          artist
        )
      `)
      .eq('playlist_id', playlist_id)
      .order('position')

    if (tracksError) {
      throw new Error(`Failed to fetch tracks: ${tracksError.message}`)
    }

    const name = `Patou Vérifié – ${playlist.band.replace('_', '–')} — Semaine ${playlist.iso_week}`
    const token = Deno.env.get('SPOTIFY_USER_OAUTH_TOKEN')

    if (!token) {
      throw new Error('SPOTIFY_USER_OAUTH_TOKEN not configured')
    }

    // Create or update Spotify playlist
    let spotifyPlaylistId = playlist.spotify_playlist_id
    
    if (!spotifyPlaylistId) {
      // Create new playlist
      const createResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          name, 
          description: 'Playlist 100% adaptée aux enfants — Patou', 
          public: true 
        })
      })

      if (!createResponse.ok) {
        throw new Error(`Failed to create Spotify playlist: ${createResponse.status}`)
      }

      const createData = await createResponse.json()
      spotifyPlaylistId = createData.id

      // Update database with Spotify playlist ID
      await supabaseAdmin
        .from('playlists')
        .update({ spotify_playlist_id: spotifyPlaylistId })
        .eq('id', playlist_id)
    } else {
      // Update existing playlist name/description
      const updateResponse = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          name, 
          description: 'Playlist 100% adaptée aux enfants — Patou' 
        })
      })

      if (!updateResponse.ok) {
        throw new Error(`Failed to update Spotify playlist: ${updateResponse.status}`)
      }
    }

    // Replace playlist tracks
    const uris = (playlistTracks || []).map((pt: any) => `spotify:track:${pt.tracks.spotify_id}`)
    
    const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ uris })
    })

    if (!tracksResponse.ok) {
      throw new Error(`Failed to update playlist tracks: ${tracksResponse.status}`)
    }

    // Mark playlist as published
    await supabaseAdmin
      .from('playlists')
      .update({ status: 'published' })
      .eq('id', playlist_id)

    return new Response(
      JSON.stringify({
        success: true,
        spotify_playlist_id: spotifyPlaylistId,
        playlist_url: `https://open.spotify.com/playlist/${spotifyPlaylistId}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})