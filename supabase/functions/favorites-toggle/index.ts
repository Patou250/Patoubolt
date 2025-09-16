import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { childId, trackId } = await req.json()
    
    if (!childId || !trackId) {
      return new Response(
        JSON.stringify({ error: 'Child ID and track ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if favorite exists
    const { data: existing } = await supabaseClient
      .from('favorites')
      .select('id')
      .eq('child_id', childId)
      .eq('track_id', trackId)
      .single()

    if (existing) {
      // Remove favorite
      const { error } = await supabaseClient
        .from('favorites')
        .delete()
        .eq('id', existing.id)

      if (error) throw error
      
      return new Response(
        JSON.stringify({ favorited: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Add favorite
      const { error } = await supabaseClient
        .from('favorites')
        .insert({
          child_id: childId,
          track_id: trackId
        })

      if (error) throw error
      
      return new Response(
        JSON.stringify({ favorited: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})