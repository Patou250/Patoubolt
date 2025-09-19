// GET /admin-songs?status=allowed|blocked&q=&page=1&pageSize=50
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "https://patou.app", // <-- mets ton domaine
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = new URL(req.url);
    const status = (url.searchParams.get("status") || "allowed") as
      | "allowed"
      | "blocked";
    const q = (url.searchParams.get("q") || "").trim();
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50");
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Sécurité simple via token
    const token = req.headers.get("x-admin-token");
    if (!token || token !== Deno.env.get("ADMIN_TOKEN")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Supabase client (service role)
    const projectUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2.45.1"
    );
    const supabase = createClient(projectUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // requête sur la vue
    let query = supabase
      .from("v_tracks_last_decision")
      .select("*", { count: "exact" })
      .eq("decision", status)
      .order("decided_at", { ascending: false })
      .range(from, to);

    if (q) {
      query = supabase
        .from("v_tracks_last_decision")
        .select("*", { count: "exact" })
        .eq("decision", status)
        .or(`name.ilike.%${q}%,artist_name.ilike.%${q}%`)
        .order("decided_at", { ascending: false })
        .range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({
        items: data || [],
        total: count || 0,
        page,
        pageSize,
      }),
      { headers: { "Content-Type": "application/json", ...cors } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }
});