import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { childId, trackId, playlistId, event, explicit } = await req.json()
      
      if (!childId || !trackId || !event) {
        return new Response(
          JSON.stringify({ error: 'Child ID, track ID, and event required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (event === 'start') {
        // Create new history entry
        const { error } = await supabaseClient
          .from('play_history')
          .insert({
            child_id: childId,
            track_id: trackId,
            playlist_id: playlistId,
            started_at: new Date().toISOString(),
            intent: 'play',
            explicit: explicit || false
          })

        if (error) throw error
      } else if (event === 'tick') {
        // Update duration for most recent entry
        const { data: recent, error: fetchError } = await supabaseClient
          .from('play_history')
          .select('*')
          .eq('child_id', childId)
          .eq('track_id', trackId)
          .is('ended_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single()

        if (fetchError || !recent) {
          return new Response(
            JSON.stringify({ error: 'No active play session found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { error: updateError } = await supabaseClient
          .from('play_history')
          .update({
            duration_sec: recent.duration_sec + 30
          })
          .eq('id', recent.id)

        if (updateError) throw updateError
      } else if (event === 'end') {
        // Mark session as ended
        const { data: recent, error: fetchError } = await supabaseClient
          .from('play_history')
          .select('*')
          .eq('child_id', childId)
          .eq('track_id', trackId)
          .is('ended_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single()

        if (fetchError || !recent) {
          return new Response(
            JSON.stringify({ error: 'No active play session found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { error: updateError } = await supabaseClient
          .from('play_history')
          .update({
            ended_at: new Date().toISOString()
          })
          .eq('id', recent.id)

        if (updateError) throw updateError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else if (req.method === 'GET') {
      const url = new URL(req.url)
      const childId = url.searchParams.get('childId')
      
      if (!childId) {
        return new Response(
          JSON.stringify({ error: 'Child ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data: history, error } = await supabaseClient
        .from('play_history')
        .select('*')
        .eq('child_id', childId)
        .order('started_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return new Response(
        JSON.stringify({ history }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Play history error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})