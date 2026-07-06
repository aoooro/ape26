# CLAUDE.md — APE 2026 Playlist Builder (`aoooro/ape26`)

Fan-facing microsite for **All Points East 2026** (Victoria Park, London — Fri 28 & Sat 29 Aug).
Fans pick a day → pick artists → build a playlist (search + pick songs) → **Reveal** page with YouTube
export and downloadable Instagram share cards.

- **Live:** https://ape26.ooo.io  (public, but `noindex` — not in search engines)
- **Repo:** https://github.com/aoooro/ape26  (GitHub account `aoooro`)
- **Local clone:** `/Users/adam/Claude/ape26`

## ⚠️ Read this first: what this app actually is

This site **IS the design-handoff prototype, deployed directly** — it is **NOT** a React / "Design→Code"
rebuild, despite what any handoff doc might assume. It runs on an in-house template runtime
(`support.js`) using custom elements: `<x-dc>`, `<sc-for>`, `<sc-if>`, and `{{ }}` interpolation.
Don't try to "find the React component" — there isn't one. All app logic is the plain-JS
`class Component { ... }` block near the **bottom of `index.html`** (after `<script type="text/x-dc">`).

## Repo layout (served at the web root)

```
index.html            ← THE APP. Markup (top) + `class Component` logic (bottom). Entry served at /.
APE Playlist.dc.html  ← Byte-identical to index.html EXCEPT it lacks the injected <meta robots noindex>.
                        The original handoff filename; kept in sync (see Invariants).
support.js            ← the <x-dc> template runtime. Do not edit; reference only.
data/ape-data.js      ← song/lineup data: window.__APE_DATA__ + window.__ARTIST_IMG__ (see Data).
brand/                ← ape-logo-longline-white.png, splatorange.jpg, splatblue.jpg, fonts/ (4 trial fonts).
images/               ← 41 artist photos (<slug>.jpg), referenced via __ARTIST_IMG__.
CNAME                 ← ape26.ooo.io (registers the custom domain on GitHub Pages).
robots.txt            ← Disallow: / (keeps the site out of search engines).
.nojekyll             ← disables Jekyll on Pages (site is a plain static copy).
README.md             ← the original Claude design handoff (context on intent/fidelity).
```

## How it works

- **Screens (state `S.screen`):** `landing → day → pick → asm(build) → reveal`. Conditionally rendered
  via `<sc-if value="{{ isLanding }}">` etc. (`isLanding`, `isDay`, `isPick`, `isAsm`, `isReveal`).
- **State** lives on the component: `screen, day, picked[], songs{artist:[videoId]}, search{}, more{},
  collapsed{}, shareHero, ready`. Key methods: `chooseDay, togglePick, autoGenerate, toggleSong,
  setSearch, toggleMore, toggleCollapse, setShareHero, restart`.
- **Song search (Build screen):** `songsFor(a)` = `display ∪ search` deduped by id. The query branch
  filters that full pool; the empty branch shows `display` quick-picks (5, or 10 with "Reveal more").
  This logic is correct — if search seems broken, it's the **data**, not the code (see Data).
- **Reveal share card** is rasterised with **html2canvas** (loaded from cdnjs) at scale 3 into two JPEGs
  (1080×1920 story + 1080×1350 feed), zipped as `all-points-east-socials.zip`.

## Local dev / preview

The prototype needs to be served over **HTTP** (font/script loads fail on `file://`).

- Preferred: the Claude Code **preview tools** (`preview_start` uses `.claude/launch.json` in the parent
  folder `APE 2026 Playlist`, which runs `python3 -m http.server 4126 --directory /Users/adam/Claude/ape26`).
  Then drive the flow with `preview_eval` (click buttons by text) and screenshot/inspect. The `<x-dc>`
  runtime re-renders on state change; to reach the Build/Reveal screens fast, click "Auto-generate".
- Or just: `cd /Users/adam/Claude/ape26 && python3 -m http.server 8000` and open `http://localhost:8000`.

## Deploy (this is how "push it live" works)

1. Edit `index.html`, then **regenerate the sibling** so both stay in sync:
   `perl -ne 'print unless /<meta name="robots" content="noindex, nofollow, noarchive">/' index.html > 'APE Playlist.dc.html.tmp' && mv 'APE Playlist.dc.html.tmp' 'APE Playlist.dc.html'`
2. Commit + `git push origin main`. GitHub Pages (legacy builder, source = `main`/root) auto-builds.
3. **The legacy builder is flaky.** Two rapid pushes can collide → both error ("Page build failed",
   duration 0); builds also sometimes hang in `building` for minutes. Remedy: re-trigger with
   `gh api -X POST repos/aoooro/ape26/pages/builds`, then poll
   `gh api repos/aoooro/ape26/pages/builds/latest -q .status` until `built`. A `.nojekyll` static site
   can't fail a build on HTML/CSS content, so treat "Page build failed" as transient first
   (also check githubstatus.com). DNS + HTTPS are already wired; nothing to do there.
4. **Verify via served content, not the build API** — the `builds/latest` commit field can lag behind
   what's actually serving. `curl -s https://ape26.ooo.io/ | grep <a-string-unique-to-your-change>`.

## Invariants / conventions (don't break these)

- **Keep `index.html` and `APE Playlist.dc.html` identical** apart from the one injected
  `<meta name="robots" content="noindex, nofollow, noarchive">` line. Always regenerate the `.dc.html`
  from `index.html` after edits (command above). Verify: `diff <(grep -v 'name="robots"' index.html) 'APE Playlist.dc.html'`.
- **Public but not searchable** — repo is public (needed for free Pages on a custom domain), but the site
  must stay out of search: keep `robots.txt` (Disallow: /) **and** the `noindex` meta.
- **Desktop is sacred on responsive fixes** — scope mobile changes to media queries; leave the desktop
  inline styles intact. Verify desktop is byte-identical after any "mobile" change.
- Edits are made to `index.html` only; `support.js` and `data/ape-data.js` are separate concerns.

## Responsive / mobile (all in the `<style>` block at the top of `index.html`)

Classes were added as media-query hooks (desktop has no rules for them):
- `@media (max-width:768px)` — hero header stacks (`.ape-topbar`, `.ape-topbar-spacer`, `.ape-logo-hero`);
  step-nav mini logo hidden (`.ape-logo-mini`).
- `@media (max-width:600px)` — day-select screen stacks into bands on **phones only** (`.ape-day-grid`
  → 1 col; `.ape-day-bg` hidden; per-band `.ape-day-fri`/`.ape-day-sat` splats; `.ape-day-col`,
  `.ape-day-cta`). Tablet/desktop keep the side-by-side 50/50 poster split.
- `@media (max-width:880px)` — the floating "Your playlist" summary panel goes static full-width
  (`#ape-summary-col` needs `min-width:0` or its no-wrap track titles overflow).

## Rendering gotchas

- **iOS renders some Unicode symbols as colour emoji.** `▶ ↗ ⚡` each have a **U+FE0E** (text
  variation selector) appended so they render monochrome on iOS (matching desktop). If you add any of
  those glyphs, append `︎`, or use an inline SVG.
- **Song add/added toggles are inline SVGs** (not `+`/`✓` text glyphs) so they're geometrically centred
  in their circles. The runtime renders inline SVG fine.
- **Reveal background** = one full-opacity orange base (`position:absolute;inset:0`) with the blue splat
  fading into it via `-webkit-mask-image` / `mask-image` linear-gradient. Do NOT go back to two
  overlapping semi-transparent (`opacity:.9`) splats — that caused a two-tone orange seam.

## Data (`data/ape-data.js`)

- `window.__APE_DATA__ = { days:{fri,sat}, artists:[…] }`. Each artist: `{ name, display_name, days,
  display[≤10 quick-picks], search[full searchable pool, ≤50] }`. Song shape: `{ id (YouTube), title,
  thumb (i.ytimg.com URL), views }`. `window.__ARTIST_IMG__` maps artist name → `images/<slug>.jpg`.
  (Note: "DJ Gummy Bear" intentionally maps to `montell-fish.jpg`.)
- **Source of truth:** `/Users/adam/Claude/APE 2026 Playlist/data/artists.json` (has extra metadata:
  `handle, channel_id, excluded`, plus `generated_at/depth/display_count`). Generated by
  `/Users/adam/Claude/APE 2026 Playlist/fetch_artists.py` (re-run at higher depth to get more tracks
  for thin artists).
- **To refresh search pools** (matched by `name`): load `ape-data.js` via `eval` in node, replace each
  artist's `search` with the source's `search` (map to `{id,title,thumb,views}`), leave `display`
  untouched, re-serialize as `window.__APE_DATA__ = <json>;\nwindow.__ARTIST_IMG__ = <json>;`.
  After the last refresh: 19 artists at the full 50, 22 with fewer (that's all that's indexed — e.g.
  Pour La Vie=1, Dove Ellis=3, Sunshine Benzi=4). Deepening those = a `fetch_artists.py` re-run.

## Assets / licensing

- **Fonts in `brand/fonts/` are TRIAL builds** (AP All Purpose Grotesk + ABC Walter). The user confirmed
  licences are cleared for this preview deploy — but re-confirm before any public/marketing launch.
- Song thumbnails are hot-linked from YouTube (`i.ytimg.com`); html2canvas loads from cdnjs. Fine for a
  preview; proxy/cache for production.

## Current state & recent work (session ending at `e315fc4`)

Repo clean, all pushed, all live. Ten commits so far (`git log --oneline`):
initial deploy → Get Tickets → https://www.allpointseastfestival.com/ → mobile header logo fit →
step-nav/day-CTA/summary-panel mobile fixes → iOS monochrome glyphs → "start your playlist" copy →
phones-only day stacking → centred SVG song toggles → **search data refresh (41 artists)** →
**Reveal two-tone orange fix**.

Open/optional: sync the un-deployed prototype archive at
`/Users/adam/Claude/APE 2026 Playlist/design_handoff_ape_playlist/design/data/ape-data.js` if desired;
deepen catalogs for thin artists via `fetch_artists.py`; wire the Terms/Privacy footer links
(currently `#` placeholders).
