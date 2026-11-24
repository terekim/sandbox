var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../engine.js
var rank = /* @__PURE__ */ __name((c) => c >> 2, "rank");
var suit = /* @__PURE__ */ __name((c) => c & 3, "suit");
var byValue = /* @__PURE__ */ __name((a, b) => a - b, "byValue");
var FIVE = ["", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"];
function classify(cards) {
  const c = [...cards].sort(byValue);
  const n = c.length;
  if (n === 1) return { type: "single", size: 1, kind: 0, key: c[0] };
  const ranks = c.map(rank);
  if (n === 2 || n === 3) {
    if (!ranks.every((r) => r === ranks[0])) return null;
    return { type: n === 2 ? "pair" : "triple", size: n, kind: 0, key: n === 2 ? c[1] : ranks[0] };
  }
  if (n !== 5) return null;
  const flush = c.every((x) => suit(x) === suit(c[0]));
  const straight = ranks[4] <= 11 && ranks.every((r, i) => r === ranks[0] + i);
  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (straight && flush) return { type: "five", size: 5, kind: 5, key: c[4] };
  if (groups[0][1] === 4) return { type: "five", size: 5, kind: 4, key: Number(groups[0][0]) };
  if (groups[0][1] === 3 && groups[1][1] === 2) return { type: "five", size: 5, kind: 3, key: Number(groups[0][0]) };
  if (flush) return { type: "five", size: 5, kind: 2, key: c[4] };
  if (straight) return { type: "five", size: 5, kind: 1, key: c[4] };
  return null;
}
__name(classify, "classify");
function beats(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "five" && a.kind !== b.kind) return a.kind > b.kind;
  return a.key > b.key;
}
__name(beats, "beats");
function describe(combo) {
  if (!combo) return "";
  if (combo.type === "five") return FIVE[combo.kind];
  return combo.type[0].toUpperCase() + combo.type.slice(1);
}
__name(describe, "describe");
function allPlays(hand) {
  const h = [...hand].sort(byValue);
  const out = [];
  const byRank = {};
  for (const c of h) (byRank[rank(c)] ||= []).push(c);
  for (const c of h) out.push([c]);
  for (const g of Object.values(byRank)) {
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      out.push([g[i], g[j]]);
      for (let k = j + 1; k < g.length; k++) out.push([g[i], g[j], g[k]]);
    }
  }
  const n = h.length;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++)
    for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) {
      const five = [h[a], h[b], h[c], h[d], h[e]];
      if (classify(five)) out.push(five);
    }
  return out.map((cards) => ({ cards, combo: classify(cards) }));
}
__name(allPlays, "allPlays");
function legal(cards, hand, lead, firstPlay) {
  if (!cards.length || new Set(cards).size !== cards.length) return "Pick some cards";
  if (!cards.every((c) => hand.includes(c))) return "Those aren't your cards";
  const combo = classify(cards);
  if (!combo) return "Not a hand";
  if (firstPlay && !cards.includes(0)) return "Start with the 3\u2666";
  if (lead) {
    if (combo.size !== lead.combo.size) return `Play ${lead.combo.size === 1 ? "a single" : lead.combo.size + " cards"}`;
    if (!beats(combo, lead.combo)) return "Not high enough";
  }
  return "";
}
__name(legal, "legal");
function botMove(hand, lead, firstPlay, othersLeft) {
  const plays = allPlays(hand);
  const weight = /* @__PURE__ */ __name((p) => p.cards.reduce((s, c) => s + c, 0) / p.cards.length, "weight");
  if (!lead) {
    let pool = firstPlay ? plays.filter((p) => p.cards.includes(0)) : plays;
    const low = Math.min(...hand);
    if (!firstPlay) pool = pool.filter((p) => p.cards.includes(low));
    pool.sort((a, b) => b.combo.size - a.combo.size || weight(a) - weight(b));
    return { play: pool[0].cards };
  }
  const options = plays.filter((p) => p.combo.size === lead.combo.size && beats(p.combo, lead.combo));
  if (!options.length) return { pass: true };
  options.sort((a, b) => a.combo.kind - b.combo.kind || a.combo.key - b.combo.key);
  const pick = options[0];
  const danger = Math.min(...othersLeft) <= 3;
  if (!danger && hand.length > 4 && pick.cards.some((c) => rank(c) === 12)) return { pass: true };
  return { play: pick.cards };
}
__name(botMove, "botMove");
function deal(random = Math.random) {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return [0, 1, 2, 3].map((s) => deck.slice(s * 13, s * 13 + 13).sort(byValue));
}
__name(deal, "deal");
var penalty = /* @__PURE__ */ __name((n) => n >= 13 ? n * 3 : n >= 10 ? n * 2 : n, "penalty");
var BOT_NAMES = ["Mei", "Kwan", "Lok", "Suki", "Tak", "Wing", "Fai", "Ying", "Chun", "Bo"];
var Table = class {
  static {
    __name(this, "Table");
  }
  constructor({
    code = "",
    mode = "private",
    send = /* @__PURE__ */ __name(() => {
    }, "send"),
    setTimer = /* @__PURE__ */ __name((fn, ms) => setTimeout(fn, ms), "setTimer"),
    clearTimer = /* @__PURE__ */ __name((t) => clearTimeout(t), "clearTimer"),
    now = Date.now,
    random = Math.random,
    turnSeconds = 30,
    lobbySeconds = 30,
    botDelay = [700, 1400]
  } = {}) {
    Object.assign(this, { code, mode, send, setTimer, clearTimer, now, random, turnSeconds, lobbySeconds, botDelay });
    this.seats = [null, null, null, null];
    this.phase = "waiting";
    this.round = 0;
    this.timer = null;
    this.startsAt = 0;
    this.history = [];
  }
  // ---- people ----
  humans() {
    return this.seats.filter((s) => s && !s.bot);
  }
  seatOf(id) {
    return this.seats.findIndex((s) => s && s.id === id);
  }
  status() {
    return { phase: this.phase, humans: this.humans().length, mode: this.mode };
  }
  join(id, name) {
    name = String(name || "Player").replace(/\s+/g, " ").trim().slice(0, 14) || "Player";
    let i = this.seatOf(id);
    if (i >= 0) {
      const s = this.seats[i];
      s.away = false;
      s.name = name;
      if (s.wasHuman) {
        s.bot = false;
        delete s.wasHuman;
        if (this.phase === "playing" && this.turn === i) this.queueTurn();
      }
      this.broadcast();
      return i;
    }
    if (this.phase !== "waiting") {
      i = this.seats.findIndex((s) => s && s.bot && !s.wasHuman);
      if (i < 0) return -1;
      Object.assign(this.seats[i], { id, name, bot: false, away: false });
      if (this.phase === "playing" && this.turn === i) this.queueTurn();
      this.broadcast();
      return i;
    }
    i = this.seats.findIndex((s) => !s);
    if (i < 0) return -1;
    this.seats[i] = { id, name, bot: false, away: false, score: 0 };
    if (this.mode === "public") {
      if (this.humans().length === 4) this.start();
      else if (!this.startsAt) {
        this.startsAt = this.now() + this.lobbySeconds * 1e3;
        this.schedule(this.lobbySeconds * 1e3, () => this.start());
      }
    }
    this.broadcast();
    return i;
  }
  leave(id) {
    const i = this.seatOf(id);
    if (i < 0) return;
    const s = this.seats[i];
    if (this.phase === "waiting") {
      this.seats[i] = null;
      this.seats = [...this.seats.filter(Boolean), null, null, null, null].slice(0, 4);
      if (!this.humans().length) {
        this.cancel();
        this.startsAt = 0;
      }
    } else {
      s.away = true;
      s.wasHuman = true;
      s.bot = true;
      if (!this.humans().length) {
        this.cancel();
        this.phase = "waiting";
        this.seats = [null, null, null, null];
        this.startsAt = 0;
        return;
      }
      if (this.phase === "playing" && this.turn === i) this.queueTurn();
    }
    this.broadcast();
  }
  // ---- game ----
  start() {
    if (this.phase !== "waiting" || !this.humans().length) return;
    const used = new Set(this.seats.filter(Boolean).map((s) => s.name));
    const names = BOT_NAMES.filter((n) => !used.has(n));
    for (let i = 0; i < 4; i++) if (!this.seats[i]) {
      const name = names.splice(Math.floor(this.random() * names.length), 1)[0];
      this.seats[i] = { id: "bot" + i, name, bot: true, away: false, score: 0 };
    }
    this.startsAt = 0;
    this.deal();
  }
  deal() {
    this.cancel();
    this.hands = deal(this.random);
    this.phase = "playing";
    this.round++;
    this.turn = this.hands.findIndex((h) => h.includes(0));
    this.lead = null;
    this.firstPlay = true;
    this.passed = [false, false, false, false];
    this.last = null;
    this.result = null;
    this.queueTurn();
    this.broadcast();
  }
  act(seat, move) {
    if (this.phase !== "playing" || seat !== this.turn) return "Not your turn";
    const hand = this.hands[seat];
    if (move.pass) {
      if (!this.lead) return "You're leading, play something";
      this.passed[seat] = true;
      this.last = { seat, pass: true };
      this.next();
      return "";
    }
    const cards = (move.cards || []).map(Number);
    const why = legal(cards, hand, this.lead, this.firstPlay);
    if (why) return why;
    this.hands[seat] = hand.filter((c) => !cards.includes(c));
    this.lead = { seat, cards: [...cards].sort(byValue), combo: classify(cards) };
    this.firstPlay = false;
    this.passed = [false, false, false, false];
    this.last = { seat, cards: this.lead.cards };
    if (!this.hands[seat].length) return this.finish(seat), "";
    this.next();
    return "";
  }
  next() {
    this.turn = (this.turn + 1) % 4;
    if (this.lead && this.turn === this.lead.seat) {
      this.lead = null;
      this.passed = [false, false, false, false];
    }
    this.queueTurn();
    this.broadcast();
  }
  finish(winner) {
    this.cancel();
    const left = this.hands.map((h) => h.length);
    const lost = left.map((n, i) => i === winner ? 0 : penalty(n));
    const won = lost.reduce((a, b) => a + b, 0);
    this.seats.forEach((s, i) => {
      s.score += i === winner ? won : -lost[i];
    });
    this.result = { winner, left, change: lost.map((l, i) => i === winner ? won : -l), hands: this.hands.map((h) => [...h]) };
    this.history.push({ round: this.round, winner: this.seats[winner].name });
    this.phase = "over";
    this.turn = -1;
    this.nextAt = this.now() + 9e3;
    this.schedule(9e3, () => this.again());
    this.broadcast();
  }
  again() {
    if (this.phase !== "over") return;
    this.deal();
  }
  queueTurn() {
    this.cancel();
    const seat = this.turn;
    const s = this.seats[seat];
    if (!s) return;
    if (s.bot) {
      const [lo, hi] = this.botDelay;
      this.deadline = 0;
      this.schedule(lo + this.random() * (hi - lo), () => this.botPlay(seat));
    } else {
      this.deadline = this.now() + this.turnSeconds * 1e3;
      this.schedule(this.turnSeconds * 1e3, () => this.timeout(seat));
    }
  }
  botPlay(seat) {
    if (this.phase !== "playing" || this.turn !== seat) return;
    const others = this.hands.filter((_, i) => i !== seat).map((h) => h.length);
    const m = botMove(this.hands[seat], this.lead, this.firstPlay, others);
    if (this.act(seat, m.pass ? { pass: true } : { cards: m.play })) this.timeout(seat);
  }
  // Ran out of time: pass, or play your lowest card when you have to lead.
  timeout(seat) {
    if (this.phase !== "playing" || this.turn !== seat) return;
    if (this.lead) this.act(seat, { pass: true });
    else this.act(seat, { cards: [this.hands[seat][0]] });
  }
  schedule(ms, fn) {
    this.cancel();
    this.timer = this.setTimer(fn, ms);
  }
  cancel() {
    if (this.timer) this.clearTimer(this.timer);
    this.timer = null;
  }
  // ---- messages from people ----
  handle(id, msg) {
    const seat = this.seatOf(id);
    if (seat < 0 || !msg) return;
    if (msg.t === "start") {
      if (this.mode === "private" ? seat === 0 : true) this.start();
    } else if (msg.t === "play" || msg.t === "pass") {
      const err = this.act(seat, msg.t === "pass" ? { pass: true } : { cards: msg.cards });
      if (err) this.send(id, { t: "nope", why: err });
    } else if (msg.t === "react") {
      const e = String(msg.e || "").slice(0, 8);
      if (REACTIONS.includes(e)) this.broadcastRaw({ t: "react", seat, e });
    }
  }
  // ---- what each person sees ----
  view(seat) {
    return {
      t: "state",
      code: this.code,
      mode: this.mode,
      phase: this.phase,
      round: this.round,
      you: seat,
      startsAt: this.startsAt,
      nextAt: this.nextAt || 0,
      now: this.now(),
      seats: this.seats.map((s, i) => s && {
        name: s.name,
        bot: s.bot && !s.wasHuman,
        away: !!s.away,
        score: s.score,
        count: this.hands && this.phase !== "waiting" ? this.hands[i].length : 0,
        passed: this.phase === "playing" ? this.passed[i] : false
      }),
      turn: this.phase === "playing" ? this.turn : -1,
      deadline: this.phase === "playing" ? this.deadline : 0,
      lead: this.lead ? { seat: this.lead.seat, cards: this.lead.cards, name: describe(this.lead.combo) } : null,
      firstPlay: !!this.firstPlay,
      last: this.last,
      result: this.phase === "over" ? this.result : null,
      hand: this.hands && seat >= 0 && this.phase !== "waiting" ? this.hands[seat] : []
    };
  }
  broadcast() {
    this.seats.forEach((s, i) => {
      if (s && !s.bot) this.send(s.id, this.view(i));
    });
  }
  broadcastRaw(msg) {
    this.seats.forEach((s) => {
      if (s && !s.bot) this.send(s.id, msg);
    });
  }
};
var REACTIONS = ["\u{1F602}", "\u{1F624}", "\u{1F44F}", "\u{1F64F}", "\u{1F608}", "\u{1FAE0}"];

// worker.js
var ALLOWED_ORIGINS = ["https://terekim.github.io", "http://localhost:8000", "http://127.0.0.1:8000"];
var LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";
var worker_default = {
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
  }
};
async function status(env, code) {
  const r = await env.TABLES.get(env.TABLES.idFromName(code)).fetch("https://do/status");
  return r.json();
}
__name(status, "status");
var Tables = class {
  static {
    __name(this, "Tables");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sockets = /* @__PURE__ */ new Map();
    this.table = null;
    this.open = null;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/lobby") return json(await this.lobby(), 200, {});
    if (url.pathname === "/status") {
      const t = this.table;
      return json(t ? { ...t.status(), empty: t.status().humans === 0 && t.phase === "waiting" } : { empty: true, phase: "waiting", humans: 0 }, 200, {});
    }
    const code = url.searchParams.get("room").toUpperCase();
    const id = (url.searchParams.get("id") || "").slice(0, 40);
    const name = url.searchParams.get("name") || "Player";
    const mode = code.startsWith("P") && code.length === 8 ? "public" : "private";
    if (!id) return new Response("no id", { status: 400 });
    if (!this.table || this.table.phase === "waiting" && this.table.humans().length === 0) {
      this.table = new Table({ code, mode, send: /* @__PURE__ */ __name((pid, msg) => this.deliver(pid, msg), "send") });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    const old = this.sockets.get(id);
    this.sockets.set(id, server);
    if (old) {
      try {
        old.close(4e3, "opened elsewhere");
      } catch {
      }
    }
    const seat = this.table.join(id, name);
    if (seat < 0) {
      server.send(JSON.stringify({ t: "full" }));
      server.close(4001, "full");
      this.sockets.delete(id);
      return new Response(null, { status: 101, webSocket: client });
    }
    server.addEventListener("message", (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.t === "ping") return server.send('{"t":"pong"}');
      this.table.handle(id, msg);
    });
    const gone = /* @__PURE__ */ __name(() => {
      if (this.sockets.get(id) !== server) return;
      this.sockets.delete(id);
      this.table.leave(id);
    }, "gone");
    server.addEventListener("close", gone);
    server.addEventListener("error", gone);
    return new Response(null, { status: 101, webSocket: client });
  }
  deliver(id, msg) {
    const ws = this.sockets.get(id);
    if (!ws) return;
    try {
      ws.send(JSON.stringify(msg));
    } catch {
    }
  }
  // The lobby hands out one public table at a time until it starts or fills, then opens another.
  async lobby() {
    if (this.open) {
      const st = await status(this.env, this.open.code);
      if (st.phase === "waiting" && st.humans < 4 && Date.now() - this.open.at < 10 * 60 * 1e3) return { code: this.open.code };
    }
    this.open = { code: "P" + randomCode(7, LETTERS + "23456789"), at: Date.now() };
    return { code: this.open.code };
  }
};
function randomCode(n, alphabet = LETTERS) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}
__name(randomCode, "randomCode");
function corsHeaders(origin) {
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, OPTIONS", "access-control-max-age": "86400", vary: "origin" };
}
__name(corsHeaders, "corsHeaders");
function json(body, status2, cors) {
  return new Response(JSON.stringify(body), { status: status2, headers: { "content-type": "application/json", "cache-control": "no-store", ...cors } });
}
__name(json, "json");

// ../../../../../../tmp/claude-0/-home-user/fa58ae90-4d70-572b-8850-7ea8f05f7ca1/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../tmp/claude-0/-home-user/fa58ae90-4d70-572b-8850-7ea8f05f7ca1/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-wh7ZGh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../../../tmp/claude-0/-home-user/fa58ae90-4d70-572b-8850-7ea8f05f7ca1/scratchpad/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-wh7ZGh/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  Tables,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
