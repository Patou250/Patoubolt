import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function weekOfYear(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime())/86400000)+1)/7);
  return { year: date.getUTCFullYear(), iso: weekNo };
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

    const { band } = await req.json()
    const { year, iso } = weekOfYear()

    // Create draft playlist
    const { data: pl, error: e1 } = await supabaseAdmin
      .from('playlists')
      .insert({ band, year, iso_week: iso })
      .select()
      .single()

    if (e1 && !e1.message.includes('duplicate key')) {
      throw new Error(e1.message)
    }

    const playlist = pl || (await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('band', band)
      .eq('year', year)
      .eq('iso_week', iso)
      .single()).data

    // Selection parameters based on age band
    const limits = band === '10_16' ? 50 : 40
    const durMin = band === '4_6' ? 90000 : band === '7_10' ? 90000 : 120000
    const durMax = band === '4_6' ? 240000 : band === '7_10' ? 270000 : 320000

    const { data: candidates, error: e2 } = await supabaseAdmin.rpc('pick_tracks_for_band', {
      band_in: band,
      dur_min: durMin,
      dur_max: durMax,
      limit_n: limits
    })

    if (e2) {
      throw new Error(e2.message)
    }

    // Clear existing tracks and insert new ones
    await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlist.id)

    const rows = (candidates || []).map((c: any, i: number) => ({
      playlist_id: playlist.id,
      track_id: c.id,
      position: i + 1
    }))

    if (rows.length) {
      await supabaseAdmin
        .from('playlist_tracks')
        .insert(rows)
    }

    return new Response(
      JSON.stringify({
        success: true,
        playlist_id: playlist.id,
        count: rows.length,
        playlist
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