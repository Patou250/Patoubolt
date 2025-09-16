import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

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
    // Créer le client Supabase avec les variables d'environnement
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ok: false
        }),
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test simple de connexion à la base de données
    // On fait une requête basique qui ne révèle aucune donnée sensible
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    const ok = !error

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ok
      }),
    }
  } catch (error) {
    console.error('Ping DB error:', error)
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ok: false
      }),
    }
  }
}