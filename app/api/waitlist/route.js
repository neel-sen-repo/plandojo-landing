export async function POST(req) {
  const data = await req.json();
  console.log("New waitlist signup:", data);

  return Response.json({ ok: true });
}
