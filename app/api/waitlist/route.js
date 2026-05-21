import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(req) {
  try {
    const { email } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!email || !email.includes("@")) {
      return Response.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Insert into Supabase table 'waitlist'
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ 
        email: email, 
        ip: ip,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return Response.json({ ok: true, message: "You're already on the list — we'll be in touch." }, { status: 200 });
      }
      console.error("Supabase error:", error);
      return Response.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return Response.json({ ok: true, message: "You're on the pilot list. We'll be in touch." }, { status: 201 });
  } catch (error) {
    console.error("[Waitlist] Internal Error:", error);
    return Response.json({ ok: false, error: "Server error. Please try again." }, { status: 500 });
  }
}

// GET remains for your metrics widget
export async function GET() {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
    
  return Response.json({ totalSignups: count || 0 });
}
