import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérification du token admin
    const adminToken = req.headers.get('x-admin-token')
    const expectedToken = Deno.env.get('ADMIN_TOKEN')
    
    if (!adminToken || !expectedToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'allowed'
    const q = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Construction de la requête
    let query = supabaseAdmin
      .from('v_tracks_last_decision')
      .select('*', { count: 'exact' })
      .eq('decision', status)
      .order('decided_at', { ascending: false })

    // Ajout du filtre de recherche si présent
    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,artist_name.ilike.%${q}%`)
    }

    // Application de la pagination
    const { data, error, count } = await query.range(from, to)

    if (error) {
      throw new Error(error.message)
    }

    return new Response(
      JSON.stringify({
        items: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in admin-songs function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})