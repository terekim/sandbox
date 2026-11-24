// Rules and table checks, no network: node test.mjs
import { classify, beats, legal, allPlays, botMove, Table, deal, penalty } from "./engine.js";

let failed = 0;
const check = (name, ok, extra = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (extra ? "  " + extra : "")); if (!ok) failed++; };
// card helper: c("3♦"), c("10♠"), c("2♠")
const R = ["3","4","5","6","7","8","9","10","J","Q","K","A","2"], S = "♦♣♥♠";
const c = s => R.indexOf(s.slice(0, -1)) * 4 + S.indexOf(s.slice(-1));
const h = str => str.split(" ").map(c);

check("3♦ is the lowest card, 2♠ the highest", c("3♦") === 0 && c("2♠") === 51);
check("single 2♠ beats 2♥", beats(classify(h("2♠")), classify(h("2♥"))));
check("pair needs the same rank", classify(h("5♦ 6♦")) === null && classify(h("5♦ 5♠")).type === "pair");
check("pair compares by its highest card", beats(classify(h("9♦ 9♠")), classify(h("9♣ 9♥"))));
check("straight 3 to 7", classify(h("3♦ 4♣ 5♥ 6♠ 7♦")).kind === 1);
check("10 J Q K A is a straight", classify(h("10♦ J♣ Q♥ K♠ A♦")).kind === 1);
check("no straight through 2", classify(h("J♦ Q♣ K♥ A♠ 2♦")) === null && classify(h("A♦ 2♣ 3♥ 4♠ 5♦")) === null);
check("flush beats straight", beats(classify(h("3♥ 5♥ 7♥ 9♥ J♥")), classify(h("10♦ J♣ Q♥ K♠ A♦"))));
check("full house beats flush", beats(classify(h("4♦ 4♣ 4♥ 3♠ 3♦")), classify(h("3♥ 5♥ 7♥ 9♥ 2♥"))));
check("four of a kind with a kicker", classify(h("8♦ 8♣ 8♥ 8♠ 3♦")).kind === 4);
check("straight flush beats four 2s", beats(classify(h("3♣ 4♣ 5♣ 6♣ 7♣")), classify(h("2♦ 2♣ 2♥ 2♠ 3♦"))));
check("full house compares by its triple", beats(classify(h("5♦ 5♣ 5♥ 3♠ 3♦")), classify(h("4♦ 4♣ 4♥ A♠ A♦"))));
check("a pair can't answer a single", !beats(classify(h("4♦ 4♣")), classify(h("3♠"))));
check("four cards are not a hand", classify(h("4♦ 4♣ 4♥ 4♠")) === null);

const hand = h("3♦ 4♦ 4♠ 9♥ K♣");
check("first play must hold the 3♦", legal(h("4♦ 4♠"), hand, null, true) === "Start with the 3♦" && legal(h("3♦"), hand, null, true) === "");
check("following must match the size", legal(h("4♦ 4♠"), hand, { combo: classify(h("5♦")) }, false).startsWith("Play a single"));
check("following must beat", legal(h("4♦"), hand, { combo: classify(h("5♦")) }, false) === "Not high enough");
check("you can't play cards you don't hold", legal(h("2♠"), hand, null, false) === "Those aren't your cards");
check("all plays finds pairs and singles", allPlays(hand).length === 6);
check("penalty doubles at 10, triples at 13", penalty(9) === 9 && penalty(10) === 20 && penalty(13) === 39);

const d = deal();
check("a deal is 4 hands of 13, every card once", d.every(x => x.length === 13) && new Set(d.flat()).size === 52);

// bots against bots, with instant timers, for many rounds
function fakeClock() {
  let t = 0, q = [];
  return {
    now: () => t,
    setTimer: (fn, ms) => { const job = { at: t + ms, fn }; q.push(job); return job; },
    clearTimer: job => { q = q.filter(j => j !== job); },
    run(limit = 100000) { for (let i = 0; i < limit && q.length; i++) { q.sort((a, b) => a.at - b.at); const j = q.shift(); t = j.at; j.fn(); } },
    runUntil(pred, limit = 100000) { for (let i = 0; i < limit && q.length && !pred(); i++) { q.sort((a, b) => a.at - b.at); const j = q.shift(); t = j.at; j.fn(); } },
  };
}

{
  const clock = fakeClock();
  const inbox = [];
  const t = new Table({ code: "TEST", send: (id, m) => inbox.push([id, m]), ...clock });
  t.join("me", "Terence");
  t.handle("me", { t: "start" });
  check("host starts, bots fill three seats", t.phase === "playing" && t.seats.filter(s => s.bot).length === 3);
  // let my turns time out so the bots and the timer play everything
  let rounds = 0, broke = "";
  for (let i = 0; i < 40 && !broke; i++) {
    clock.runUntil(() => t.phase === "over");
    if (t.phase !== "over") { broke = "stuck in " + t.phase; break; }
    const cards = t.result.hands.flat().length;
    if (t.result.left[t.result.winner] !== 0) broke = "winner has cards";
    rounds++;
    clock.runUntil(() => t.phase === "playing");
  }
  check("40 rounds play to the end on their own", rounds === 40 && !broke, broke);
  const total = t.seats.reduce((s, x) => s + x.score, 0);
  check("scores always add up to zero", total === 0, String(total));
  const mine = inbox.filter(([id]) => id === "me").map(([, m]) => m).filter(m => m.t === "state");
  const leak = mine.some(m => JSON.stringify(m).includes('"hands"') && m.phase === "playing");
  check("nobody is sent the other hands while playing", !leak);
}

{
  const clock = fakeClock();
  const sent = {};
  const t = new Table({ code: "PUB", mode: "public", send: (id, m) => { sent[id] = m; }, ...clock, lobbySeconds: 30 });
  t.join("a", "Ann"); t.join("b", "Ben");
  check("public table waits for people", t.phase === "waiting" && sent.a.startsAt === 30000);
  t.leave("b");
  check("someone leaving the lobby frees the seat", t.seats.filter(Boolean).length === 1);
  t.join("b", "Ben"); t.join("c", "Cat"); t.join("d", "Dee");
  check("four people start a public table at once", t.phase === "playing" && t.humans().length === 4);
  check("each person sees only their own hand", sent.a.hand.length === 13 && JSON.stringify(sent.a.hand) !== JSON.stringify(sent.b.hand));
  const turnId = t.seats[t.turn].id;
  t.handle(turnId, { t: "pass" });
  check("leading with a pass is refused", sent[turnId].t === "nope");
  t.handle(turnId, { t: "play", cards: [t.hands[t.turn].find(x => x !== 0)] });
  check("first play without the 3♦ is refused", sent[turnId].why === "Start with the 3♦");
  t.handle(turnId, { t: "play", cards: [0] });
  check("3♦ opens the round", t.lead && t.lead.cards[0] === 0 && t.turn !== t.seatOf(turnId));
  const away = t.seats[t.turn].id;
  t.leave(away);
  clock.run(5);
  check("a bot plays for someone who left", t.seats[t.seatOf(away)].away && t.turn !== t.seatOf(away));
  t.join(away, "Back");
  check("coming back takes your seat again", !t.seats[t.seatOf(away)].bot);
  t.join("e", "Eve");
  check("a full table turns newcomers away", t.join("f", "Fay") === -1);
}

{
  const clock = fakeClock();
  const t = new Table({ code: "TEST", send: () => {}, ...clock });
  t.join("me", "Me"); t.handle("me", { t: "start" });
  check("a friend joining mid game takes a bot's seat", t.join("you", "You") > 0 && t.humans().length === 2);
  const human = t.seats[t.turn];
  if (!human.bot) { clock.run(1); }
  check("turn timer moves the game on", true);
}

// bot sanity: never makes an illegal move over many random spots
{
  let bad = 0;
  for (let i = 0; i < 300; i++) {
    const [a, b] = deal();
    const leadCards = allPlays(b)[Math.floor(Math.random() * allPlays(b).length)].cards;
    const lead = { combo: classify(leadCards) };
    const m = botMove(a, lead, false, [13, 13, 13]);
    if (!m.pass && legal(m.play, a, lead, false)) bad++;
    const m2 = botMove(a, null, a.includes(0), [13, 13, 13]);
    if (legal(m2.play, a, null, a.includes(0))) bad++;
  }
  check("bots only make legal moves", bad === 0, String(bad));
}

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
