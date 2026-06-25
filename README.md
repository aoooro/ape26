# Handoff: APE 2026 Playlist Builder

> **Live preview:** https://ape26.ooo.io — this repo is the deployed prototype, served via GitHub Pages from the root (`index.html` is the prototype entry; `APE Playlist.dc.html` is the original handoff file, identical content). Brand fonts are licensed for this deployment. Search-engine indexing is disabled (`robots.txt` + `noindex`).

## Overview
A fan-facing microsite for **All Points East 2026** (Victoria Park, London — Fri 28 & Sat 29 August). Fans build a personal "festival playlist" by picking a day, choosing artists from that day's lineup, selecting one or more songs per artist, then revealing a shareable playlist they can export to YouTube and download as Instagram share cards.

It is a single-page, multi-screen flow (a 3-step wizard wrapped in a landing screen and a reveal screen):

1. **Landing** – hero splash, intro, "Start Your Setlist" CTA.
2. **Step 1 / Pick your day** – poster-style split screen, choose Friday or Saturday.
3. **Step 2 / Pick artists** – grid of artist tiles for the chosen day.
4. **Step 3 / Build playlist** – per-artist song pickers with a floating "Your playlist" summary panel.
5. **Reveal** – final playlist, YouTube export, and downloadable Instagram share cards.

## About the Design Files
The files in `design/` are a **design reference built in HTML** — a working prototype that shows the intended look, layout, copy, and behaviour. They are **not** production code to copy verbatim.

The prototype is authored as a single "Design Component" (`APE Playlist.dc.html`) that runs on a small in-house runtime (`support.js`). **Do not port `support.js` or the `<x-dc>` / `<sc-for>` / `<sc-if>` / `{{ }}` templating into the real app** — that runtime is just what made the prototype render. Instead, **recreate these designs in the target codebase's existing environment** (React, Vue, Svelte, SwiftUI, native, etc.) using its established components, routing, and state patterns. If no environment exists yet, choose the most appropriate modern framework (a React + Vite SPA is a natural fit) and implement there.

The prototype logic (the `class Component` block near the bottom of `APE Playlist.dc.html`) is plain JavaScript and is an accurate, readable reference for the **state model and behaviour** — translate it, don't transplant it.

## Fidelity
**High-fidelity (hifi).** Colours, typography, spacing, copy, and interactions are final and should be reproduced pixel-faithfully. Where exact pixel values matter they are given below; otherwise read them from the inline styles in `APE Playlist.dc.html`.

---

## Design Tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| Ink (background) | `#0c0c0e` | Page background, dark UI, button text on light |
| Cream (foreground) | `#F4F1EA` | Primary text, light buttons, summary panel bg |
| Orange (accent) | `#F0521E` | Selection state, "picked" pills, step markers, YouTube button |
| Blue (splat) | `#292bc6` | Sampled from `splatblue.jpg`; used as the "tap an artist" pill on Reveal |
| Card surface | `#141417` / `#161619` | Song blocks, artist tile placeholder |
| Muted text | `#75747c`, `#a3a2a8` | Secondary labels inside the cream summary panel |
| Hairline (on dark) | `rgba(244,241,234,0.14)` | Borders / dividers |

### Typography
Two trial typefaces ship in `design/brand/fonts/` (see **Assets** for licensing note):
- **AP All Purpose Grotesk** — primary face. Weights used: Medium (≤500), Bold (600–700), Black (800–900). Headlines are Black, uppercase, tight tracking (`letter-spacing:-.02em` to `-.03em`).
- **ABC Walter** (variable) — used **italic** for accent words ("playlist", "festival", "build your playlist", day dates). Never the primary body face.
- **ui-monospace** system stack — small mono labels (step subtitles, set-row numbers, "tap an artist" caption, "Stage TBC / Set time TBC").

Headline scale uses fluid `clamp()`; representative sizes:
- Landing H1 `clamp(42px, 7.6vw, 100px)`
- Day-select "Tyler, The Creator" `clamp(42px, 8.6vw, 120px)`
- Reveal H2 "YOUR APE PLAYLIST" `clamp(30px, 5vw, 54px)`
- Build H2 "Pick the songs…" `clamp(28px, 4.4vw, 52px)`

### Spacing / radius / motion
- Pill buttons: `border-radius:999px`, padding ~`14px 28px`, uppercase, `letter-spacing:.03–.06em`, weight 700.
- Cards/tiles: square corners (radius 0) for artist tiles and song blocks; `outline:1px solid rgba(244,241,234,.14)`.
- Entrance animations: `apeIn` (opacity + translateY 12px), `apeUp` (opacity + translateY 20px, often staggered via `animation-delay`), `apeFade` (opacity only). Duration `.4–.6s`, easing `cubic-bezier(.2,.7,.2,1)`. **Note:** the Build-playlist screen must use an opacity-only fade (no transform) — a lingering transform on that screen's container breaks the floating panel's fixed positioning (see Step 3).
- Film-grain overlay: full-screen fixed SVG-noise `div`, `opacity:.15`, `mix-blend-mode:overlay`, `z-index:80`, `pointer-events:none`. Toggleable.

---

## Screens / Views

### 1. Landing
- **Purpose:** Set the tone and start the flow.
- **Layout:** Full-viewport flex column. Background is a **single hero split**: `splatorange.jpg` clipped to the top `58vh`, `splatblue.jpg` clipped below it (`clip-path: inset(...)`), so the two splats read as one image with a hard horizontal seam at 58% of viewport height.
- **Components:**
  - Header (z-index 6, padding `26px 40px 0`): centered APE wordmark logo (`height:46px`), a right-aligned **Get Tickets ↗** pill (cream bg, ink text), and an empty `120px` spacer left for balance.
  - Festival info line just under the logo: uppercase, `letter-spacing:.26em`, e.g. "All Points East 2026 · 28–29 August · Victoria Park, London".
  - H1 **"Build Your *Festival* Playlist"** — Title Case, "Festival" in ABC Walter italic on its own line.
  - Sub-copy (sits on the blue half): "Pick your day. Choose your artists. Make the playlist for your All Points East."
  - CTA pill **"Start Your Setlist →"** (cream bg, ink text).
  - Footer links **Terms & Conditions | Privacy Policy** (placeholder `#`).
- **Behaviour:** CTA → Pick your day. Hover scales the CTA `1.04`.

### 2. Pick your day (Step 1 / 3)
- **Purpose:** Choose Friday or Saturday (one day per playlist).
- **Layout:** Poster-style **hard 50/50 vertical split** — orange (`splatorange.jpg`) left, blue (`splatblue.jpg`) right, no gradient overlay. Sticky top bar with back control + centered mini logo (`height:20px`) + step indicator.
- **Components:**
  - "Both nights · Headlining" eyebrow, then **"Tyler, The Creator"** headline across the top, centered.
  - Two clickable columns (Friday / Saturday). Each shows: day name (Black uppercase) + italic date ("Fri 28 Aug" / "Sat 29 Aug"); three headliners large; an `[ A–Z ]` label; then the remaining lineup in a 2-column A–Z list; and a **"Build {Day} set →"** pill.
  - Footer T&Cs; step footer "Step **1** / 3 · Tap a day to start your setlist".
- **Behaviour:** Clicking a column selects that day and advances to Pick artists. Headliner highlights are hard-coded (`Rex Orange County, Turnstile, Mariah The Scientist` for Fri; `Daniel Caesar, Baby Keem, Dijon` for Sat); the A–Z list is everyone else on that day, alpha-sorted, excluding Tyler.

### 3. Pick artists (Step 2 / 3)
- **Purpose:** Select which artists from the chosen day to include.
- **Layout:** Sticky top bar (back to Day, centered mini logo, "Step 2 / 3" marker). Heading block "Who do you want to see?" + helper copy. Responsive grid of square tiles: `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:14px`.
- **Components — artist tile:** square image (`object-fit:cover`, hover `scale(1.06)`); artist name **below** the image in cream Black uppercase 14px (the tile is a `<button>`, so set the text colour explicitly — buttons don't inherit it). Selected state: `outline:3px solid #F0521E` inset, orange tint overlay `rgba(240,82,30,.16)`, and a circular orange ✓ badge top-right.
- **Behaviour:** Tap toggles selection. A fixed bottom action bar shows count and a continue affordance; an **"⚡ Auto-generate my playlist"** option selects the whole day and one random top-5 song per artist, jumping straight to Build.

### 4. Build playlist (Step 3 / 3)
- **Purpose:** Choose songs per selected artist and review the running set.
- **Layout:** Sticky top bar ("← Artists", mini logo, "Step 3 / 3"). Content header is a **two-column row** — left: H2 "Pick the songs. *build your playlist.*" (italic accent); right (right-aligned): helper "One song each by default - add more from your favourite artists. **{Day label}**" — with a **divider rule beneath the header**. Below: a two-column body — song pickers (left, `flex:1 1 460px`) and a **floating "Your playlist" panel** (right).
- **Components:**
  - **Artist song block** (one per picked artist): collapsible header with artist name + "{n} picked" orange pill + ▾/▸ chevron. Open body: a search input (filters that artist's catalogue) and a list of song rows (62×35-ish thumbnail, title, +/✓ toggle). A "show more / less" toggles 5↔10 results. Selected rows get a 3px orange left bar and a filled orange ✓.
  - **Floating summary panel ("Your playlist")**: cream (`#F4F1EA`) card, ink text. Shows total count, progress, a numbered removable track list, and a **"Reveal playlist →"** button (enabled once every picked artist has ≥1 song). **Implementation note:** the prototype pins this with `position:fixed` (top 78px, right 28px, width 340px) inside a reserved 340px flex column, with a `@media (max-width:880px)` fallback that returns it to normal flow below the songs. The original `position:sticky` did **not** work because of an `overflow:auto` wrapper + a transform on the screen container; in a clean React app `position:sticky; top:78px` inside the column will usually work — verify in your environment and fall back to fixed only if needed.
  - Footer T&Cs.

### 5. Reveal
- **Purpose:** Present the finished playlist and let the user share/export it.
- **Layout:** Full-viewport, background is blue (top 60%) over orange (from 40%), **no dark gradient overlay**. Header matches Landing (logo `height:46px` + Get Tickets). Centered title block.
- **Components:**
  - Centered H2 **"YOUR APE *PLAYLIST*"** (italic accent), with the day label and a "{n} songs · {n} artists" subtitle beneath; pushed down from the logo with top margin.
  - Track list card: each row = thumbnail + title + artist + "Stage TBC / Set time TBC" mono label.
  - **Share card** (the thing that gets exported): a 360×450 (4:5) preview card, **Bleed style only** (the prototype previously had Poster/Split variants — these were removed). It is: full-bleed hero image of the chosen artist, dark bottom gradient + soft-light orange tint, logo + italic day label top, "My set · {n} tracks", up to **5** "**Artist** – track" lines then a "**+ N more**" line, and a footer rule with "{n} tracks · build yours · all points east".
  - Below the card: round artist avatars in a **blue (`#292bc6`) pill** captioned "Tap an artist to change the cover" — tapping one swaps which artist's photo is the hero.
  - **Download Socials Card** button → generates two images and bundles them into one **`all-points-east-socials.zip`** (see Interactions).
  - **▶ Open in YouTube**, **← Edit**, **Start over** buttons. "Set times and stages to be announced." note. Footer T&Cs.

---

## Interactions & Behaviour

- **Track-title cleaning** (used on the share card): raw titles come from YouTube and are messy. Reproduce the prototype's `cleanTitle(title, artistName)` exactly:
  1. If the title matches `"…" by Uploader`, keep only the quoted part.
  2. Strip bracketed/parenthetical format tags containing words like *official, audio, video, visualizer, lyric(s), hd, hq, explicit, remaster, 4k, mv*.
  3. Strip a trailing `by {artistName}` credit (only when it matches the artist — so "Stand By Me" is preserved).
  4. Trim wrapping quotes/whitespace.
  Then `stripArtist` removes a leading `"{Artist} - "` prefix. Render as **`{Artist} – {cleanTitle}`**, capped at 5 lines with a `+ N more` line.

- **Share-card hero image must crop, not stretch.** Render the hero as a **`background-image` with `background-size:cover`**, *not* an `<img object-fit:cover>`. (The prototype originally used object-fit, but the image-capture step stretched it; background-size cover crops correctly. In your stack, whichever approach you use, verify the exported raster crops on the sides and preserves aspect.)

- **Download Socials Card** → renders the share card twice at two crops and zips both:
  - `all-points-east-instagram-story.jpg` — 1080×1920 (9:16)
  - `all-points-east-instagram-feed.jpg` — 1080×1350 (4:5)
  The prototype rasterises the card DOM with **html2canvas** at scale 3 (preview card is 360×450; the story render forces the clone to 360×640), then packs both JPEGs into a store-method (uncompressed) ZIP built by hand. In production use your platform's preferred approach (server-side render, `canvas`/`satori`, or a maintained zip lib such as JSZip). Keep the two output sizes and filenames.

- **Open in YouTube** → collects all selected video IDs in order and opens a YouTube watch/playlist URL in a new tab.

- **Navigation:** Back controls step backward; "Start over" resets all state to the Landing screen. Every screen transition scrolls to top.

- **Hover states:** pills scale `~1.03–1.04`; artist tile image scales `1.06`; nav/text links underline and go full-opacity.

---

## State Management

The whole flow is one component's state (translate to your store/route model):

| State | Type | Meaning |
|---|---|---|
| `screen` | `'landing' \| 'day' \| 'pick' \| 'asm' \| 'reveal'` | Current view (consider mapping to routes) |
| `day` | `'fri' \| 'sat' \| null` | Chosen day |
| `picked` | `string[]` | Selected artist names (order preserved) |
| `songs` | `{ [artistName]: videoId[] }` | Chosen songs per artist |
| `search` | `{ [artistName]: string }` | Per-artist search query (Build screen) |
| `more` | `{ [artistName]: boolean }` | Whether that artist shows 10 vs 5 results |
| `collapsed` | `{ [artistName]: boolean }` | Collapsed song blocks |
| `shareHero` | `string \| null` | Which artist's photo is the share-card hero (defaults to first picked, in lineup order) |
| `ready` | `boolean` | Data loaded |

Key transitions: `chooseDay` (resets selections, → pick) · `togglePick` · `autoGenerate` (all artists + 1 random top-5 song each, → asm) · `toggleSong` · `setSearch` / `toggleMore` / `toggleCollapse` · `setShareHero` · `restart`. "Reveal" is enabled only when every picked artist has ≥1 song (`allPicked`).

Derived data per render: artist tiles, collapsible song blocks, the numbered set list, reveal rows, and the cleaned share lines (see `renderVals()` in the prototype).

---

## Data

All content is in **`design/data/ape-data.js`** as two globals:

- `window.__APE_DATA__`:
  - `days.fri` / `days.sat` → `{ label, artists: string[] }` (artist names, in lineup order; Tyler appears in both).
  - `artists[]` → `{ name, display_name, days, display:[…], search:[…] }`. Each song object is `{ id (YouTube video id), title, thumb (YouTube thumbnail URL), views }`. `display` is the curated top list; `search` is a larger searchable pool. The prototype merges them by id in `songsFor()`.
- `window.__ARTIST_IMG__`: `{ [artistName]: "images/<file>.jpg" }` mapping to the local artist photos.

Treat this as seed/fixture data. In production, serve it from your own API/CMS; the shape above is a good contract. Note `"DJ Gummy Bear"` maps to `images/montell-fish.jpg` intentionally.

---

## Assets

All under `design/`:
- **`brand/ape-logo-longline-white.png`** — APE wordmark, white, transparent PNG (used at 20px in nav bars, 46px on Landing/Reveal).
- **`brand/splatorange.jpg`, `brand/splatblue.jpg`** — the orange & blue paint-splat background images. The blue accent colour `#292bc6` was sampled from `splatblue.jpg`.
- **`brand/fonts/`** — `APAllPurposeGroteskTRIAL-{Black,Bold,Medium}.otf` and `ABCWalterNeueVariable-Trial.ttf`. ⚠️ **These are TRIAL fonts.** Acquire properly licensed versions of AP All Purpose Grotesk and ABC Walter before any public launch; do not ship the trial files.
- **`images/`** — 41 artist photos (`<artist-slug>.jpg`), referenced via `__ARTIST_IMG__`.
- **Song thumbnails** are hot-linked from YouTube (`https://i.ytimg.com/vi/<id>/…`) — fine for a prototype; cache/proxy them for production.
- **External lib:** the prototype loads `html2canvas@1.4.1` from cdnjs for the share-card raster (replace per the Interactions note).

---

## Files
- `design/APE Playlist.dc.html` — the full prototype: markup (top) + the `class Component` logic block (bottom, after `<script type="text/x-dc">`). Read the logic block for exact behaviour; read the inline styles for exact visuals.
- `design/support.js` — prototype runtime only. **Reference for nothing; do not port.**
- `design/data/ape-data.js` — seed data (see Data).
- `design/brand/`, `design/images/` — assets (see Assets).

To preview the prototype as-is, serve the `design/` folder over HTTP (e.g. `npx serve design`) and open `APE Playlist.dc.html` — opening via `file://` will block the font/script loads.
