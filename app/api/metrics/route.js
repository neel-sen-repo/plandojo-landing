import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.csv");
const BOT_PATTERN = /\b(bot|crawler|spider|curl|python|java|wget|fetch|httpclient|scraper|libwww|monitor|facebookexternalhit|slurp|bingbot|yandex|duckduckbot|baiduspider|semrush|ahrefs)\b/i;

async function ensureVisitsFile() {
  try {
    await access(VISITS_FILE);
  } catch {
    await mkdir(path.dirname(VISITS_FILE), { recursive: true });
    await writeFile(VISITS_FILE, JSON.stringify({ visits: 0 }, null, 2) + "\n", "utf8");
  }
}

async function readVisitsCount() {
  try {
    await ensureVisitsFile();
    const content = await readFile(VISITS_FILE, "utf8");
    const parsed = JSON.parse(content || "{}");
    return Number.isFinite(parsed.visits) ? parsed.visits : 0;
  } catch {
    return 0;
  }
}

async function writeVisitsCount(value) {
  await ensureVisitsFile();
  await writeFile(VISITS_FILE, JSON.stringify({ visits: value }, null, 2) + "\n", "utf8");
}

async function getTotalSignups() {
  try {
    const content = await readFile(WAITLIST_FILE, "utf8");
    const uniqueEmails = new Set(
      content
        .split("\n")
        .filter(Boolean)
        .slice(1)
        .map((line) => line.split(",")[1]?.trim().toLowerCase())
        .filter(Boolean)
    );
    return uniqueEmails.size;
  } catch {
    return 0;
  }
}

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

  // If there are no browser-specific headers, make a best-effort check of the
  // Accept header. Treat as bot only when Accept is present and clearly not
  // indicative of a browser (for example some crawlers send non-browser MIME
  // types). Also allow the common wildcard `*/*` which browsers may send.
  if (!hasBrowserSignal) {
    if (accept && !accept.includes("application/json") && !accept.includes("text/html") && !accept.includes("*/*")) {
      return true;
    }
  }

  return false;
}

export async function GET() {
  const visits = await readVisitsCount();
  const totalSignups = await getTotalSignups();
  return Response.json({
    visits,
    totalSignups,
    lastUpdated: new Date().toISOString(),
  });
}

export async function POST(req) {
  if (isLikelyBot(req)) {
    return new Response(null, { status: 204 });
  }

  const visits = (await readVisitsCount()) + 1;
  await writeVisitsCount(visits);
  const totalSignups = await getTotalSignups();

  return Response.json({
    ok: true,
    visits,
    totalSignups,
    lastUpdated: new Date().toISOString(),
  });
}
