import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// CORS headers for admin API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  // Check admin token
  const adminToken = req.headers.get('x-admin-token');
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Forbidden - Invalid admin token' }, 
      { status: 403, headers: corsHeaders }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'allowed') as 'allowed'|'blocked';
  const q = (searchParams.get('q') || '').trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabaseAdmin
      .from('v_tracks_last_decision')
      .select('*', { count: 'exact' })
      .eq('decision', status)
      .order('decided_at', { ascending: false });

    if (q) query = query.or(`name.ilike.%${q}%,artist_name.ilike.%${q}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        items: data || [], 
        total: count || 0, 
        page, 
        pageSize,
        success: true 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}