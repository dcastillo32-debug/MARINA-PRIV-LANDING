// Records a visit of the website in Marina Privé's database (table "SiteVisit"), with the
// approximate place Netlify knows from the connection (country, city, coordinates).
// The key below is the public "anon" key: it can only add visit lines, not read them.
const SUPABASE_URL = "https://xcdtkztkkdhmkcrfjpil.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZHRrenRra2RobWtjcmZqcGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTMxODIsImV4cCI6MjEwODMyOTE4Mn0.teKVbyQYo9FSk4V2BN3591qLk0B-dWLoD0JS7nHGEgA";
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|monitor/i;
const cut = (v, n) => (v == null ? null : String(v).slice(0, n));

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const ua = req.headers.get("user-agent") || "";
  if (BOTS.test(ua)) return new Response(null, { status: 204 });
  let b = {};
  try { b = await req.json(); } catch {}
  const g = context.geo || {};
  const row = {
    site: "marinaprive.com",
    event: ["view", "form"].includes(b.event) ? b.event : "view",
    path: cut(b.path, 120), ref: cut(String(b.ref || "").toLowerCase().replace(/[^a-z0-9-]/g, ""), 40) || null,
    referrer: cut(b.referrer, 200) || null, lang: cut(b.lang, 20), device: b.device === "mobile" ? "mobile" : "desktop",
    visitor: cut(b.visitor, 40),
    country: cut(g.country?.code, 2), country_name: cut(g.country?.name, 60), region: cut(g.subdivision?.name, 60),
    city: cut(g.city, 80), lat: typeof g.latitude === "number" ? g.latitude : null, lon: typeof g.longitude === "number" ? g.longitude : null,
    timezone: cut(g.timezone, 40),
  };
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/SiteVisit`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
  } catch {}
  return new Response(null, { status: 204 });
};

export const config = { path: "/api/visit" };
