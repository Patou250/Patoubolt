import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'allowed') as 'allowed'|'blocked';
  const q = (searchParams.get('q') || '').trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('v_tracks_last_decision')
    .select('*', { count: 'exact' })
    .eq('decision', status)
    .order('decided_at', { ascending: false });

  if (q) query = query.or(`name.ilike.%${q}%,artist_name.ilike.%${q}%`);

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data || [], total: count || 0, page, pageSize });
}