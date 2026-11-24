// big-two: rooms for Big Two. One Durable Object per table runs the same Table as the page,
// so the server deals, checks every play and only ever tells you your own cards.
//
//   GET  /new                 a fresh private room code
//   GET  /quick               the code of a public table that is still filling up
//   GET  /ws?room=CODE&id=..&name=..&mode=private|public   join a table (WebSocket)

import { Table } from "../engine.js";

const ALLOWED_ORIGINS = ["https://terekim.github.io", "http://localhost:8000", "http://127.0.0.1:8000"];
const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I, L, O: easy to read out loud

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const cors = ALLOWED_ORIGINS.includes(origin) ? corsHeaders(origin) : {};
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);

    if (url.pathname === "/new" || url.pathname === "/quick") {
      if (!cors["access-control-allow-origin"]) return json({ error: "not allowed" }, 403, {});
      if (url.pathname === "/quick") {
        const lobby = env.TABLES.get(env.TABLES.idFromName("lobby"));
        return json(await (await lobby.fetch("https://do/lobby")).json(), 200, cors);
      }
      for (let i = 0; i < 6; i++) {
        const code = randomCode(4);
        const st = await status(env, code);
        if (st.empty) return json({ code }, 200, cors);
      }
      return json({ error: "try again" }, 503, cors);
    }

    if (url.pathname === "/ws") {
      if (request.headers.get("upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
      if (origin && !ALLOWED_ORIGINS.includes(origin)) return new Response("not allowed", { status: 403 });
      const code = (url.searchParams.get("room") || "").toUpperCase();
      if (!/^[A-Z]{4}$|^P[A-Z0-9]{7}$/.test(code)) return new Response("bad room", { status: 400 });
      return env.TABLES.get(env.TABLES.idFromName(code)).fetch(request);
    }

    if (url.pathname === "/") return new Response("big-two rooms are up", { headers: cors });
    return json({ error: "not found" }, 404, cors);
  },
};

async function status(env, code) {
  const r = await env.TABLES.get(env.TABLES.idFromName(code)).fetch("https://do/status");
  return r.json();
}

// Each Durable Object is either one table or the lobby (the object named "lobby").
export class Tables {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sockets = new Map(); // player id -> WebSocket
    this.table = null;
    this.open = null; // lobby only: { code }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/lobby") return json(await this.lobby(), 200, {});
    if (url.pathname === "/status") {
      const t = this.table;
      return json(t ? { ...t.status(), empty: t.status().humans === 0 && t.phase === "waiting" } : { empty: true, phase: "waiting", humans: 0 }, 200, {});
    }
    // a person joining over a WebSocket
    const code = url.searchParams.get("room").toUpperCase();
    const id = (url.searchParams.get("id") || "").slice(0, 40);
    const name = url.searchParams.get("name") || "Player";
    const mode = code.startsWith("P") && code.length === 8 ? "public" : "private";
    if (!id) return new Response("no id", { status: 400 });
    if (!this.table || (this.table.phase === "waiting" && this.table.humans().length === 0)) {
      this.table = new Table({ code, mode, send: (pid, msg) => this.deliver(pid, msg) });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    const old = this.sockets.get(id);
    this.sockets.set(id, server);
    if (old) { try { old.close(4000, "opened elsewhere"); } catch {} }
    const seat = this.table.join(id, name);
    if (seat < 0) {
      server.send(JSON.stringify({ t: "full" }));
      server.close(4001, "full");
      this.sockets.delete(id);
      return new Response(null, { status: 101, webSocket: client });
    }
    server.addEventListener("message", e => {
      let msg; try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.t === "ping") return server.send('{"t":"pong"}');
      this.table.handle(id, msg);
    });
    const gone = () => {
      if (this.sockets.get(id) !== server) return; // replaced by a newer connection
      this.sockets.delete(id);
      this.table.leave(id);
    };
    server.addEventListener("close", gone);
    server.addEventListener("error", gone);
    return new Response(null, { status: 101, webSocket: client });
  }

  deliver(id, msg) {
    const ws = this.sockets.get(id);
    if (!ws) return;
    try { ws.send(JSON.stringify(msg)); } catch {}
  }

  // The lobby hands out one public table at a time until it starts or fills, then opens another.
  async lobby() {
    if (this.open) {
      const st = await status(this.env, this.open.code);
      if (st.phase === "waiting" && st.humans < 4 && Date.now() - this.open.at < 10 * 60 * 1000) return { code: this.open.code };
    }
    this.open = { code: "P" + randomCode(7, LETTERS + "23456789"), at: Date.now() };
    return { code: this.open.code };
  }
}

function randomCode(n, alphabet = LETTERS) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map(b => alphabet[b % alphabet.length]).join("");
}

function corsHeaders(origin) {
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, OPTIONS", "access-control-max-age": "86400", vary: "origin" };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...cors } });
}
