# big-two rooms

A Cloudflare Worker with one Durable Object per table. It runs the same `Table` from `../engine.js` as the page,
so the server deals, checks every play and only sends each person their own cards.

- `GET /new` gives a fresh 4 letter room code for friends.
- `GET /quick` gives the public table that is still filling up (it starts 30 seconds after the first person sits,
  or at once with four; bots fill empty seats).
- `GET /ws?room=CODE&id=..&name=..` joins a table over a WebSocket.

Someone who drops out is played by a bot until they come back. A friend who joins mid game takes a bot's seat.

Run locally: `npx wrangler dev` here, then open the page with `?server=http://127.0.0.1:8787`.

Deploy: `npx wrangler deploy` here (needs a Cloudflare API token with Workers Scripts edit). Durable Objects on the
free plan use the SQLite backend, which `wrangler.toml` asks for. Then put the worker's URL in `SERVER` in
`../index.html`.
