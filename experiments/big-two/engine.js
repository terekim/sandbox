// Big Two: rules, bots and the table. Shared by the page (games against bots on the phone)
// and the server (rooms with real people), so both play exactly the same game.
//
// A card is a number 0..51: rank * 4 + suit. Ranks run 3 4 5 6 7 8 9 10 J Q K A 2 (0..12),
// suits run diamonds clubs hearts spades (0..3). So a bigger number is always a stronger single,
// and 0 is the 3 of diamonds, which starts every round.

export const RANKS = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
export const SUITS = ["♦", "♣", "♥", "♠"];
export const rank = c => c >> 2;
export const suit = c => c & 3;
export const label = c => RANKS[rank(c)] + SUITS[suit(c)];
const byValue = (a, b) => a - b;

export const FIVE = ["", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"];

// What a set of cards is, or null when it isn't a hand you can play.
// Straights run 3 to A (a 2 never sits in a straight) and compare by their top card.
export function classify(cards) {
  const c = [...cards].sort(byValue);
  const n = c.length;
  if (n === 1) return { type: "single", size: 1, kind: 0, key: c[0] };
  const ranks = c.map(rank);
  if (n === 2 || n === 3) {
    if (!ranks.every(r => r === ranks[0])) return null;
    return { type: n === 2 ? "pair" : "triple", size: n, kind: 0, key: n === 2 ? c[1] : ranks[0] };
  }
  if (n !== 5) return null;
  const flush = c.every(x => suit(x) === suit(c[0]));
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

export function beats(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "five" && a.kind !== b.kind) return a.kind > b.kind;
  return a.key > b.key;
}

export function describe(combo) {
  if (!combo) return "";
  if (combo.type === "five") return FIVE[combo.kind];
  return combo.type[0].toUpperCase() + combo.type.slice(1);
}

// Every hand you could play from these cards.
export function allPlays(hand) {
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
  return out.map(cards => ({ cards, combo: classify(cards) }));
}

// Is this play allowed right now?
export function legal(cards, hand, lead, firstPlay) {
  if (!cards.length || new Set(cards).size !== cards.length) return "Pick some cards";
  if (!cards.every(c => hand.includes(c))) return "Those aren't your cards";
  const combo = classify(cards);
  if (!combo) return "Not a hand";
  if (firstPlay && !cards.includes(0)) return "Start with the 3♦";
  if (lead) {
    if (combo.size !== lead.combo.size) return `Play ${lead.combo.size === 1 ? "a single" : lead.combo.size + " cards"}`;
    if (!beats(combo, lead.combo)) return "Not high enough";
  }
  return "";
}

// A plain bot: get rid of low cards, beat with the cheapest hand that works, keep 2s for later.
export function botMove(hand, lead, firstPlay, othersLeft) {
  const plays = allPlays(hand);
  const weight = p => p.cards.reduce((s, c) => s + c, 0) / p.cards.length;
  if (!lead) {
    let pool = firstPlay ? plays.filter(p => p.cards.includes(0)) : plays;
    const low = Math.min(...hand);
    if (!firstPlay) pool = pool.filter(p => p.cards.includes(low));
    // dump as many low cards as you can in one go, five card hands first
    pool.sort((a, b) => b.combo.size - a.combo.size || weight(a) - weight(b));
    // a single left with a pair or triple of the same rank is wasteful; the sort above prefers the bigger hand
    return { play: pool[0].cards };
  }
  const options = plays.filter(p => p.combo.size === lead.combo.size && beats(p.combo, lead.combo));
  if (!options.length) return { pass: true };
  options.sort((a, b) => (a.combo.kind - b.combo.kind) || (a.combo.key - b.combo.key));
  const pick = options[0];
  const danger = Math.min(...othersLeft) <= 3;
  if (!danger && hand.length > 4 && pick.cards.some(c => rank(c) === 12)) return { pass: true };
  return { play: pick.cards };
}

export function deal(random = Math.random) {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return [0, 1, 2, 3].map(s => deck.slice(s * 13, s * 13 + 13).sort(byValue));
}

// Penalty for cards left: 1 each, doubled from 10, tripled for all 13.
export const penalty = n => (n >= 13 ? n * 3 : n >= 10 ? n * 2 : n);

const BOT_NAMES = ["Mei", "Kwan", "Lok", "Suki", "Tak", "Wing", "Fai", "Ying", "Chun", "Bo"];

// One table of four seats. The server runs one per room; the page runs one for games against bots.
// `send(playerId, message)` delivers to a person. Timers are injected so tests can run them instantly.
export class Table {
  constructor({ code = "", mode = "private", send = () => {}, setTimer = (fn, ms) => setTimeout(fn, ms), clearTimer = t => clearTimeout(t),
                now = Date.now, random = Math.random, turnSeconds = 30, lobbySeconds = 30, botDelay = [700, 1400] } = {}) {
    Object.assign(this, { code, mode, send, setTimer, clearTimer, now, random, turnSeconds, lobbySeconds, botDelay });
    this.seats = [null, null, null, null]; // { id, name, bot, away, score }
    this.phase = "waiting";
    this.round = 0;
    this.timer = null;
    this.startsAt = 0;
    this.history = [];
  }

  // ---- people ----
  humans() { return this.seats.filter(s => s && !s.bot); }
  seatOf(id) { return this.seats.findIndex(s => s && s.id === id); }
  status() { return { phase: this.phase, humans: this.humans().length, mode: this.mode }; }

  join(id, name) {
    name = String(name || "Player").replace(/\s+/g, " ").trim().slice(0, 14) || "Player";
    let i = this.seatOf(id);
    if (i >= 0) { // coming back
      const s = this.seats[i];
      s.away = false; s.name = name;
      if (s.wasHuman) { s.bot = false; delete s.wasHuman; if (this.phase === "playing" && this.turn === i) this.queueTurn(); }
      this.broadcast();
      return i;
    }
    if (this.phase !== "waiting") {
      // mid game a newcomer takes over a bot's seat, cards and score included
      i = this.seats.findIndex(s => s && s.bot && !s.wasHuman);
      if (i < 0) return -1;
      Object.assign(this.seats[i], { id, name, bot: false, away: false });
      if (this.phase === "playing" && this.turn === i) this.queueTurn();
      this.broadcast();
      return i;
    }
    i = this.seats.findIndex(s => !s);
    if (i < 0) return -1;
    this.seats[i] = { id, name, bot: false, away: false, score: 0 };
    if (this.mode === "public") {
      if (this.humans().length === 4) this.start();
      else if (!this.startsAt) { this.startsAt = this.now() + this.lobbySeconds * 1000; this.schedule(this.lobbySeconds * 1000, () => this.start()); }
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
      // keep seats packed so the host is always seat 0
      this.seats = [...this.seats.filter(Boolean), null, null, null, null].slice(0, 4);
      if (!this.humans().length) { this.cancel(); this.startsAt = 0; }
    } else {
      s.away = true; s.wasHuman = true; s.bot = true; // a bot plays for you until you come back
      if (!this.humans().length) { this.cancel(); this.phase = "waiting"; this.seats = [null, null, null, null]; this.startsAt = 0; return; }
      if (this.phase === "playing" && this.turn === i) this.queueTurn();
    }
    this.broadcast();
  }

  // ---- game ----
  start() {
    if (this.phase !== "waiting" || !this.humans().length) return;
    const used = new Set(this.seats.filter(Boolean).map(s => s.name));
    const names = BOT_NAMES.filter(n => !used.has(n));
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
    this.turn = this.hands.findIndex(h => h.includes(0));
    this.lead = null;      // { seat, cards, combo }
    this.firstPlay = true;
    this.passed = [false, false, false, false];
    this.last = null;      // what just happened, for the page to animate
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
    this.hands[seat] = hand.filter(c => !cards.includes(c));
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
    if (this.lead && this.turn === this.lead.seat) { this.lead = null; this.passed = [false, false, false, false]; } // everyone passed: free lead
    this.queueTurn();
    this.broadcast();
  }

  finish(winner) {
    this.cancel();
    const left = this.hands.map(h => h.length);
    const lost = left.map((n, i) => (i === winner ? 0 : penalty(n)));
    const won = lost.reduce((a, b) => a + b, 0);
    this.seats.forEach((s, i) => { s.score += i === winner ? won : -lost[i]; });
    this.result = { winner, left, change: lost.map((l, i) => (i === winner ? won : -l)), hands: this.hands.map(h => [...h]) };
    this.history.push({ round: this.round, winner: this.seats[winner].name });
    this.phase = "over";
    this.turn = -1;
    this.nextAt = this.now() + 9000;
    this.schedule(9000, () => this.again());
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
      this.deadline = this.now() + this.turnSeconds * 1000;
      this.schedule(this.turnSeconds * 1000, () => this.timeout(seat));
    }
  }

  botPlay(seat) {
    if (this.phase !== "playing" || this.turn !== seat) return;
    const others = this.hands.filter((_, i) => i !== seat).map(h => h.length);
    const m = botMove(this.hands[seat], this.lead, this.firstPlay, others);
    if (this.act(seat, m.pass ? { pass: true } : { cards: m.play })) this.timeout(seat);
  }

  // Ran out of time: pass, or play your lowest card when you have to lead.
  timeout(seat) {
    if (this.phase !== "playing" || this.turn !== seat) return;
    if (this.lead) this.act(seat, { pass: true });
    else this.act(seat, { cards: [this.hands[seat][0]] });
  }

  schedule(ms, fn) { this.cancel(); this.timer = this.setTimer(fn, ms); }
  cancel() { if (this.timer) this.clearTimer(this.timer); this.timer = null; }

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
      code: this.code, mode: this.mode, phase: this.phase, round: this.round, you: seat,
      startsAt: this.startsAt, nextAt: this.nextAt || 0, now: this.now(),
      seats: this.seats.map((s, i) => s && {
        name: s.name, bot: s.bot && !s.wasHuman, away: !!s.away, score: s.score,
        count: this.hands && this.phase !== "waiting" ? this.hands[i].length : 0,
        passed: this.phase === "playing" ? this.passed[i] : false,
      }),
      turn: this.phase === "playing" ? this.turn : -1,
      deadline: this.phase === "playing" ? this.deadline : 0,
      lead: this.lead ? { seat: this.lead.seat, cards: this.lead.cards, name: describe(this.lead.combo) } : null,
      firstPlay: !!this.firstPlay,
      last: this.last,
      result: this.phase === "over" ? this.result : null,
      hand: this.hands && seat >= 0 && this.phase !== "waiting" ? this.hands[seat] : [],
    };
  }

  broadcast() {
    this.seats.forEach((s, i) => { if (s && !s.bot) this.send(s.id, this.view(i)); });
  }

  broadcastRaw(msg) {
    this.seats.forEach(s => { if (s && !s.bot) this.send(s.id, msg); });
  }
}

export const REACTIONS = ["😂", "😤", "👏", "🙏", "😈", "🫠"];
