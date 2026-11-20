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
| [style](experiments/style/) | Living art-direction style guide for the Campfire project: character system (the quality bar) with live examples, palette, motion, and in-progress environment. |
| [campfire](experiments/campfire/) | Sit at a fire with strangers, no words. Send warmth, feed the flames. Co-presence prototype with labelled AI tenders. MVP on a local mock. |
| [held](experiments/held/) | Leave one small anonymous line, hold a stranger's, and learn yours was held too. Ambient anonymous co-presence. MVP runs on a local mock; wire Firebase for real strangers. |
| [dirtbags](experiments/dirtbags/) | Turn-based artillery worms. Destructible terrain, wind, three weapons, and an AI opponent. Fully offline, installable. |
| [motherlode](experiments/motherlode/) | A mining incremental to sink hours into. Dig, automate, descend through strata, collapse to prestige. Fully offline, installable. |
| [typo-derby](experiments/typo-derby/) | The daily typing derby. Race the gang on one shared track a day, or practice offline. Installable as a PWA. |
| [typo-derby-flat](experiments/typo-derby-flat/) | Typo Derby restyled: a new cast of hand-inked blobs and a chunky, rounded UI. Same game, separate PWA. |
| [typo-derby-doodle](experiments/typo-derby-doodle/) | The blob gang with a UI drawn by the same pen: paper white, thin wobbly ink, hand lettering, flat character colors. |

## Running locally

Clone the repo and open any `index.html` directly in a browser, or serve the root for the full gallery:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
