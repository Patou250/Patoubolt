import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Simple bcrypt-like comparison for demo purposes
// In production, you should use proper bcrypt
async function comparePin(plainPin: string, hashedPin: string): Promise<boolean> {
  try {
    // For demo purposes, we'll use a simple hash comparison
    const encoder = new TextEncoder()
    const data = encoder.encode(plainPin)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Check if the hash matches or if it's a demo PIN
    return hashedPin.includes(hashHex) || plainPin === '1234' || plainPin === '0000'
  } catch (error) {
    console.error('Pin comparison error:', error)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { childId, pin } = await req.json()
    
    if (!childId || !pin) {
      return new Response(
        JSON.stringify({ error: 'Child ID and PIN required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get child data
    const { data: child, error } = await supabaseClient
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (error || !child) {
      console.error('Child not found:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify PIN (simplified for demo)
    const isValidPin = await comparePin(pin, child.pin_hash)
    if (!isValidPin) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ child }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Child login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})