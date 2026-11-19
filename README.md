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
| [typo-derby](experiments/typo-derby/) | The daily typing derby. Race the gang on one shared track a day, or practice offline. Installable as a PWA. |

## Running locally

Clone the repo and open any `index.html` directly in a browser, or serve the root for the full gallery:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
