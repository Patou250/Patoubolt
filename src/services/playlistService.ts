function weekOfYear(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime())/86400000)+1)/7);
  return { year: date.getUTCFullYear(), iso: weekNo };
}

export async function generatePlaylistForBand(band: '4_6' | '7_10' | '10_16') {
  const { supabaseAdmin } = await import('../lib/supabaseAdmin');
  const { year, iso } = weekOfYear();

  try {
    // Create draft playlist
    const { data: pl, error: e1 } = await supabaseAdmin
      .from('playlists')
      .insert({ band, year, iso_week: iso })
      .select()
      .single();

    if (e1 && !e1.message.includes('duplicate key')) {
      throw new Error(e1.message);
    }

    const playlist = pl || (await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('band', band)
      .eq('year', year)
      .eq('iso_week', iso)
      .single()).data;

    // Selection parameters based on age band
    const limits = band === '10_16' ? 50 : 40;
    const durMin = band === '4_6' ? 90000 : band === '7_10' ? 90000 : 120000;
    const durMax = band === '4_6' ? 240000 : band === '7_10' ? 270000 : 320000;

    // Get candidate tracks using RPC function
    const { data: candidates, error: e2 } = await supabaseAdmin.rpc('pick_tracks_for_band', {
      band_in: band,
      dur_min: durMin,
      dur_max: durMax,
      limit_n: limits
    });

    if (e2) {
      throw new Error(e2.message);
    }

    // Clear existing tracks and insert new ones
    await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlist.id);

    const rows = (candidates || []).map((c: any, i: number) => ({
      playlist_id: playlist.id,
      track_id: c.id,
      position: i + 1
    }));

    if (rows.length) {
      await supabaseAdmin
        .from('playlist_tracks')
        .insert(rows);
    }

    return {
      success: true,
      playlist_id: playlist.id,
      count: rows.length,
      playlist
    };

  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
}

export async function getPlaylistsByBand(band?: string) {
  const { supabaseAdmin } = await import('../lib/supabaseAdmin');
  
  try {
    let query = supabaseAdmin
      .from('playlists')
      .select(`
        *,
        playlist_tracks (
          position,
          tracks (
            id,
            spotify_id,
            title,
            artist,
            duration_ms,
            cover_url
          )
        )
      `)
      .order('year', { ascending: false })
      .order('iso_week', { ascending: false });

    if (band) {
      query = query.eq('band', band);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
}

async function getSpotifyUserToken(): Promise<string> {
  // Pour la bêta: utilise un token utilisateur récupéré manuellement (ou OAuth parent admin)
  // Place-le en env: VITE_SPOTIFY_USER_OAUTH_TOKEN
  const token = import.meta.env.VITE_SPOTIFY_USER_OAUTH_TOKEN;
  if (!token) {
    throw new Error('VITE_SPOTIFY_USER_OAUTH_TOKEN not configured');
  }
  return token;
}

export async function publishPlaylistToSpotify(playlistId: string) {
  const { supabaseAdmin } = await import('../lib/supabaseAdmin');
  
  try {
    // Get playlist data
    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      throw new Error(`Failed to fetch playlist: ${playlistError.message}`);
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
      .eq('playlist_id', playlistId)
      .order('position');

    if (tracksError) {
      throw new Error(`Failed to fetch tracks: ${tracksError.message}`);
    }

    const name = `Patou Vérifié – ${playlist.band.replace('_', '–')} — Semaine ${playlist.iso_week}`;
    const token = await getSpotifyUserToken();

    // Create or update Spotify playlist
    let spotifyPlaylistId = playlist.spotify_playlist_id;
    
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
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create Spotify playlist: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      spotifyPlaylistId = createData.id;

      // Update database with Spotify playlist ID
      await supabaseAdmin
        .from('playlists')
        .update({ spotify_playlist_id: spotifyPlaylistId })
        .eq('id', playlistId);
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
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update Spotify playlist: ${updateResponse.status}`);
      }
    }

    // Replace playlist tracks
    const uris = (playlistTracks || []).map((pt: any) => `spotify:track:${pt.tracks.spotify_id}`);
    
    const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ uris })
    });

    if (!tracksResponse.ok) {
      throw new Error(`Failed to update playlist tracks: ${tracksResponse.status}`);
    }

    // Mark playlist as published
    await supabaseAdmin
      .from('playlists')
      .update({ status: 'published' })
      .eq('id', playlistId);

    return {
      success: true,
      spotify_playlist_id: spotifyPlaylistId,
      playlist_url: `https://open.spotify.com/playlist/${spotifyPlaylistId}`
    };

  } catch (error) {
    console.error('Error publishing playlist to Spotify:', error);
    throw error;
  }
}