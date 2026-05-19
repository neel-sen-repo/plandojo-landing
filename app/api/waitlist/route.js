import { access, appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

let geoip;
try {
  geoip = require("geoip-lite");
} catch {
  geoip = null;
}

const CSV_FILE = path.join(process.cwd(), "data", "waitlist.csv");
const CSV_HEADER = [
  "timestamp",
  "email",
  "ip",
  "country",
  "region",
  "city",
  "latitude",
  "longitude",
].join(",");

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function ensureCsvFile() {
  try {
    await access(CSV_FILE);
  } catch {
    await mkdir(path.dirname(CSV_FILE), { recursive: true });
    await appendFile(CSV_FILE, `${CSV_HEADER}\n`, "utf8");
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validation
    if (!email) {
      return Response.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return Response.json(
        { ok: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get geolocation
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      req.headers.get("remote_addr")?.trim() ||
      "unknown";

    const geo = ip !== "unknown" && geoip ? geoip.lookup(ip) : null;
    
    const row = {
      timestamp: new Date().toISOString(),
      email: email.toLowerCase().trim(),
      ip,
      country: geo?.country || "",
      region: geo?.region || "",
      city: geo?.city || "",
      latitude: geo?.ll?.[0] ?? "",
      longitude: geo?.ll?.[1] ?? "",
    };

    // Save to CSV
    await ensureCsvFile();
    const csvLine = Object.values(row).map(csvEscape).join(",") + "\n";
    await appendFile(CSV_FILE, csvLine, "utf8");

    console.log("[Waitlist] Signup successful:", row.email);
    
    return Response.json(
      { 
        ok: true, 
        message: "Welcome to the waitlist! 🎉" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Waitlist] Error:", error);
    return Response.json(
      { ok: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to check waitlist stats
export async function GET() {
  try {
    const content = await readFile(CSV_FILE, "utf8");
    const lines = content.split("\n").filter(Boolean).slice(1); // skip header and empty
    return Response.json({
      totalSignups: lines.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ totalSignups: 0 });
  }
}
