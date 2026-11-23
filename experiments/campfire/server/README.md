# campfire-talk

A Cloudflare Worker that lets the campfire's characters talk through Claude. The Anthropic key lives here, never in the
page, so nobody visiting the campfire is ever asked for a key.

The page sends `POST /talk` with the character's name and the conversation. The worker writes the character's voice
itself, so the URL can only ever be used for a campfire chat, never as a free general Claude.

Guards:
- Only `https://terekim.github.io` (and `http://localhost:8000` for testing) may call it.
- Each visitor gets 60 messages a day, and the whole fire gets 400 a day (counted in KV, keys start with `campfire:`).
- The real spend limit is the monthly limit you set in the Anthropic console.

Replies run on Claude Haiku 5.5, kept to a couple of sentences, so 400 messages is well under a dollar.

Check without deploying, against a fake Claude (costs nothing): `node test.mjs`

## Deploy (once, from the phone)

Same steps as Lou's token server, in the same Cloudflare account.

1. Cloudflare dashboard, Workers and Pages, Create, Worker. Name it `campfire-talk`, Deploy. Then Edit code, replace
   it all with `worker.js`, Deploy.
2. The worker's Settings, Bindings, Add, KV namespace: variable name `COUNTS`, namespace `lou-counts` (the one Lou
   already uses; the campfire's counts are kept apart by their `campfire:` prefix).
3. The worker's Settings, Variables and Secrets, add a secret `ANTHROPIC_KEY` with an Anthropic API key
   (console.anthropic.com, API keys; a new key made just for this is best).
4. Anthropic console, Settings, Limits: set a monthly spend limit, for example $10.
5. Send Claude the worker's URL (`https://campfire-talk.<you>.workers.dev`). It goes into `TALK_URL` in
   `../index.html`, and the key prompt disappears from the campfire.

Optional: variables `DAILY_CAP` and `PER_VISITOR_CAP` change the two limits.
