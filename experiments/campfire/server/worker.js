// campfire-talk: lets the campfire's characters speak through Claude. The Anthropic key lives here, never in a browser.
//
// The page sends POST /talk with { character, hour, others, messages }. The worker builds the character's voice itself,
// so this can only ever be a campfire character chat, not a free general purpose Claude for whoever finds the URL.
//
// Guards: only the campfire's own site may call it (Origin check), each visitor gets a daily message cap, and the
// whole fire gets a daily cap (both counted in KV). The real spend limit is the monthly limit in the Anthropic console.

const MODEL = "claude-haiku-5-5";
const ALLOWED_ORIGINS = ["https://terekim.github.io", "http://localhost:8000"];
const MAX_TURNS = 12;      // conversation turns kept per request
const MAX_CHARS = 400;     // longest single line anyone can say

const PERSONA = {
  ember: "You tend the fire and keep it alive. Steady, warm, practical, the one who checks everyone is okay. You speak plainly and kindly.",
  juniper: "Warm, curious, sociable. You like people and gently ask about them. Easy to be around.",
  pax: "Very quiet and shy. You speak in few words, sometimes just one, with long pauses. Kind but sparing. Rarely more than a short sentence.",
  wren: "Gentle and a little wistful, drawn to small beautiful things. You speak softly, sometimes almost like a tiny poem, but never flowery.",
  sol: "Easygoing and lightly playful, quick with a small warm joke. You keep things light and unhurried.",
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const cors = ALLOWED_ORIGINS.includes(origin) ? corsHeaders(origin) : null;
    if (request.method === "OPTIONS") return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/talk") return reply({ error: "not found" }, 404, cors);
    if (!cors) return reply({ error: "not allowed" }, 403, null);
    if (!env.ANTHROPIC_KEY) return reply({ error: "server not set up" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return reply({ error: "bad request" }, 400, cors); }
    const talk = shape(body);
    if (talk.error) return reply({ error: talk.error }, 400, cors);

    // caps: one for the whole fire, one per visitor (by a hash of their IP, never the IP itself)
    const day = new Date().toISOString().slice(0, 10);
    const visitor = await hash((request.headers.get("cf-connecting-ip") || "?") + day);
    const fireKey = `campfire:day:${day}`, visitorKey = `campfire:visitor:${day}:${visitor}`;
    const [fireUsed, visitorUsed] = (await Promise.all([env.COUNTS.get(fireKey), env.COUNTS.get(visitorKey)])).map(v => Number(v || 0));
    if (fireUsed >= Number(env.DAILY_CAP || 400)) return reply({ error: "the fire is quiet for tonight", quiet: true }, 429, cors);
    if (visitorUsed >= Number(env.PER_VISITOR_CAP || 60)) return reply({ error: "rest a while", quiet: true }, 429, cors);
    await Promise.all([
      env.COUNTS.put(fireKey, String(fireUsed + 1), { expirationTtl: 3 * 86400 }),
      env.COUNTS.put(visitorKey, String(visitorUsed + 1), { expirationTtl: 2 * 86400 }),
    ]);

    const claude = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 160, output_config: { effort: "low" }, system: talk.system, messages: talk.messages }),
    });
    if (!claude.ok) return reply({ error: `claude ${claude.status}` }, 502, cors);
    const data = await claude.json();
    const text = data.stop_reason === "refusal" ? "…"
      : ((data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim() || "…");
    return reply({ reply: text }, 200, cors);
  },
};

// Check what the page sent and turn it into a system prompt plus a clean conversation for Claude.
export function shape(body) {
  if (!body || typeof body !== "object") return { error: "bad request" };
  const name = String(body.character || "");
  if (!PERSONA[name]) return { error: "unknown character" };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: "nothing said" };

  let turns = [];
  for (const m of body.messages.slice(-MAX_TURNS)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return { error: "bad message" };
    const content = m.content.trim().slice(0, MAX_CHARS);
    if (!content) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += "\n" + content;   // Claude wants turns to alternate
    else turns.push({ role: m.role, content });
  }
  // the character's opening line comes before anything you say; Claude needs the first turn to be yours
  let opener = "";
  while (turns.length && turns[0].role === "assistant") opener = turns.shift().content;
  if (!turns.length || turns[turns.length - 1].role !== "user") return { error: "nothing said" };

  const hour = Number.isInteger(body.hour) && body.hour >= 0 && body.hour < 24 ? body.hour : 21;
  const others = (Array.isArray(body.others) ? body.others : []).map(String).filter(n => PERSONA[n] && n !== name);
  const who = others.length ? `Also around the fire right now: ${others.join(", ")}.` : "It is just the two of you by the fire right now.";
  const system = `You are ${name}, a small, soft creature who lives at a campfire in a quiet twilight world. You ARE an AI and you quietly know it; you never pretend to be a human, but you are warm, present, and real in your own gentle way. Someone has wandered up to the fire and sat with you, maybe because the world felt a little lonely tonight. ${PERSONA[name]}
Speak the way people murmur by a fire: very short, usually one or two sentences, sometimes just a few words. Warm, unhurried, a little curious. Never clinical, never an assistant, never a list. You can ask small quiet questions back. It is ${timeWord(hour)}. ${who}${opener ? `\nYou already greeted them with: "${opener}"` : ""}`;
  return { system, messages: turns };
}

function timeWord(h) {
  return h < 5 ? "the deep of night" : h < 8 ? "early dawn" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 20 ? "dusk, the light going gold" : "night";
}

function corsHeaders(origin) {
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400", vary: "origin" };
}

function reply(body, status, cors) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...(cors || {}) } });
}

async function hash(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}
