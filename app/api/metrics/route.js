import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BOT_PATTERN = /\b(bot|crawler|spider|curl|python|java|wget|fetch|httpclient|scraper|libwww|monitor|facebookexternalhit|slurp|bingbot|yandex|duckduckbot|baiduspider|semrush|ahrefs)\b/i;

function isLikelyBot(req) {
  const userAgent = req.headers.get("user-agent") || "";
  if (BOT_PATTERN.test(userAgent)) {
    return true;
  }

  const secFetchMode = req.headers.get("sec-fetch-mode") || "";
  const secCHUA = req.headers.get("sec-ch-ua") || "";
  const secCHUAMobile = req.headers.get("sec-ch-ua-mobile") || "";
  const xRequestedWith = (req.headers.get("x-requested-with") || "").toLowerCase();
  const accept = (req.headers.get("accept") || "").toLowerCase();

  const hasBrowserSignal =
    Boolean(secFetchMode) ||
    Boolean(secCHUA) ||
    Boolean(secCHUAMobile) ||
    xRequestedWith === "xmlhttprequest";

  if (!hasBrowserSignal) {
    if (accept && !accept.includes("application/json") && !accept.includes("text/html") && !accept.includes("*/*")) {
      return true;
    }
  }

  return false;
}

export async function GET() {
  if (!supabase) {
    return Response.json({
      visits: 0,
      totalSignups: 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    const [
      { data: visitsData },
      { count: homeownerSignups },
      { count: proSignups },
    ] = await Promise.all([
      supabase.from('metrics').select('value').eq('id', 'visits').single(),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).or('source.eq.homeowner,source.is.null'),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('source', 'pro'),
    ]);

    return Response.json({
      visits: visitsData ? parseInt(visitsData.value) : 0,
      homeownerSignups: homeownerSignups || 0,
      proSignups: proSignups || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({
      visits: 0,
      totalSignups: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export async function POST(req) {
  if (isLikelyBot(req)) {
    return new Response(null, { status: 204 });
  }

  if (!supabase) {
    return Response.json({
      ok: true,
      visits: 1,
      totalSignups: 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    // Attempt to upsert the visits count (increment by 1)
    // Note: In a high-traffic production app, an RPC function would be safer for atomic increments.
    const { data: visitsData } = await supabase.from('metrics').select('value').eq('id', 'visits').single();
    const currentVisits = visitsData ? parseInt(visitsData.value) : 0;
    const newVisits = currentVisits + 1;

    await supabase.from('metrics').upsert({ id: 'visits', value: newVisits });

    const [{ count: homeownerSignups }, { count: proSignups }] = await Promise.all([
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).or('source.eq.homeowner,source.is.null'),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('source', 'pro'),
    ]);

    return Response.json({
      ok: true,
      visits: newVisits,
      homeownerSignups: homeownerSignups || 0,
      proSignups: proSignups || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({
      ok: false,
      error: "Failed to update metrics",
    }, { status: 500 });
  }
}
