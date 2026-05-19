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

async function getExistingEmails() {
  try {
    await ensureCsvFile();
    const content = await readFile(CSV_FILE, "utf8");
    const lines = content.split("\n").filter(Boolean).slice(1);
    return new Set(
      lines
        .map((line) => line.split(",")[1]?.trim().toLowerCase())
        .filter(Boolean)
    );
  } catch {
    return new Set();
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

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmails = await getExistingEmails();

    if (existingEmails.has(normalizedEmail)) {
      return Response.json(
        {
          ok: false,
          error: "You are already signed up, thank you!",
        },
        { status: 409 }
      );
    }

    // Get geolocation
    // Extract IP from common headers. Also support the `Forwarded` header
    // (e.g. `for=1.2.3.4; proto=https`) by extracting the first `for=` token.
    const headerVal =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-client-ip") ||
      req.headers.get("forwarded") ||
      req.headers.get("remote_addr") ||
      "";

    let ip = "";
    if (headerVal) {
      // If Forwarded header present, try to parse `for=` token
      if (/for=/i.test(headerVal)) {
        const m = headerVal.match(/for=([^;,"]+)/i);
        if (m && m[1]) ip = m[1].replace(/"/g, "").trim();
      }
      if (!ip) {
        ip = headerVal.split(",")[0]?.trim();
      }
    }
    if (!ip) ip = "unknown";

    // Helper to skip private/local addresses
    function isPrivateOrLocal(addr) {
      if (!addr) return true;
      if (addr === "unknown") return true;
      if (addr === "::1" || addr === "127.0.0.1") return true;
      // IPv4 private ranges
      if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.)/.test(addr)) return true;
      // IPv6 unique/local (fc00::/7)
      if (/^fc00:|^fd00:/.test(addr)) return true;
      return false;
    }

    let geo = null;
    const shouldLookup = ip && !isPrivateOrLocal(ip);

    if (shouldLookup && geoip) {
      geo = geoip.lookup(ip);
    }

    // Fallback: call a lightweight public geo IP service only when needed.
    // Use HTTPS `ipapi.co` which is reliable for simple lookups.
    if (shouldLookup && !geo) {
      try {
        const resp = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
          headers: { Accept: "application/json" },
        });
        if (resp.ok) {
          const j = await resp.json();
          if (j && !j.error) {
            geo = {
              country: j.country || "",
              region: j.region || j.region_code || "",
              city: j.city || "",
              ll:
                typeof j.latitude !== "undefined" && typeof j.longitude !== "undefined"
                  ? [j.latitude, j.longitude]
                  : null,
            };
          }
        }
      } catch (e) {
        // silently ignore network errors
      }
    }
    const row = {
      timestamp: new Date().toISOString(),
      email: normalizedEmail,
      ip,
      country: geo?.country || "",
      region: geo?.region || "",
      city: geo?.city || "",
      latitude: geo?.ll?.[0] ?? "",
      longitude: geo?.ll?.[1] ?? "",
    };

    // Save to CSV
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
    await ensureCsvFile();
    const content = await readFile(CSV_FILE, "utf8");
    const uniqueEmails = new Set(
      content
        .split("\n")
        .filter(Boolean)
        .slice(1)
        .map((line) => line.split(",")[1]?.trim().toLowerCase())
        .filter(Boolean)
    );

    return Response.json({
      totalSignups: uniqueEmails.size,
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ totalSignups: 0 });
  }
}
