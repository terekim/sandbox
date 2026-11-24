# sandbox

A personal playground for fast, polished front-end experiments. Every experiment is a self-contained static page, so you can open any one by double-clicking its `index.html`. No build step, no dependencies.

**Live site:** https://terekim.github.io/sandbox/

## How it works

- Each experiment lives in its own folder under [`experiments/`](experiments/), named with a short kebab-case slug.
- Default stack is plain HTML, CSS, and vanilla JS. Frameworks only when a specific experiment calls for one.
- The root [`index.html`](index.html) is a gallery that links to every experiment, and the whole repo deploys as one static site via GitHub Pages.
- Built mobile-first. Most of these are made to be viewed on a phone.

## Experiments

| Experiment | Description |
|------------|-------------|
| [big-two](experiments/big-two/) | Big Two, the card game. Private rooms with a 4 letter code, a public lobby that fills with strangers (bots fill empty seats), and practice against bots on the phone. Rooms run on a Cloudflare Worker with Durable Objects (`experiments/big-two/server`). |
| [character-creator](experiments/character-creator/) | Make your own Campfire character: shape, size, colour, hair, and face. Saves to the campfire so your creation becomes "you" at the fire. |
| [style](experiments/style/) | Living art-direction style guide for the Campfire project: character system (the quality bar) with live examples, palette, motion, and in-progress environment. |
| [campfire](experiments/campfire/) | Sit at a fire and actually talk with the labelled AI characters (brings your own Anthropic key, stored in your browser). Send warmth, feed the flames, share a log, wander and sit with quiet strangers. |
| [held](experiments/held/) | Leave one small anonymous line, hold a stranger's, and learn yours was held too. Ambient anonymous co-presence. MVP runs on a local mock; wire Firebase for real strangers. |
| [dirtbags](experiments/dirtbags/) | Turn-based artillery worms. Destructible terrain, wind, three weapons, and an AI opponent. Fully offline, installable. |
| [motherlode](experiments/motherlode/) | A mining incremental to sink hours into. Dig, automate, descend through strata, collapse to prestige. Fully offline, installable. |
| [typo-derby](experiments/typo-derby/) | The daily typing derby. Race the gang on one shared track a day, or practice offline. Installable as a PWA. |
| [typo-derby-flat](experiments/typo-derby-flat/) | Typo Derby restyled: a new cast of hand-inked blobs and a chunky, rounded UI. Same game, separate PWA. |
| [type-a-saurus](experiments/type-a-saurus/) | Typing race with hand-drawn blob runners and little stories to type. Quick races, a daily story, and online lobbies filled out by AI typists. Installable, works offline. |
| [typo-derby-doodle](experiments/typo-derby-doodle/) | The blob gang in a calm, editorial layout: big character hero, open paper, thin rules, Bricolage Grotesque type. |

## Running locally

Clone the repo and open any `index.html` directly in a browser, or serve the root for the full gallery:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
