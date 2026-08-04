# Oval Financial Forum — site

Marketing site for OFF, an Ohio State student organisation that publishes a
monthly financial newsletter. Static SPA plus one serverless function.

Directory is still named `agency-landing` from when this began as an agency
landing-page study. The project is no longer that.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind v4 via `@tailwindcss/vite`. **All tokens live in
  `src/index.css` `@theme`** — there is no `tailwind.config.js`
- GSAP 3.15 + ScrollTrigger + SplitText (all free since 3.13)
- Lenis smooth scroll, wired to GSAP's ticker
- `three` / `@react-three/fiber` / `@react-three/drei` are installed but
  **unused** — no WebGL anywhere. Remove them if nothing needs 3D
- Deployed on Vercel from `main`. `api/` holds Node serverless functions;
  Vite has no server runtime, so a dev-only middleware in `vite.config.ts`
  mounts them into `npm run dev` (see Backend)

Commands: `npm run dev`, `npm run build`, `npm run lint` (oxlint),
`node api/subscribe.test.mts` (handler self-check).

## Layout

```
src/
  App.tsx            section order
  content.ts         ALL copy — every section reads from here
  index.css          @theme tokens, utilities, reduced-motion rules
  lib/anim.ts        splitters, reveal hooks, curtain promise, Lenis setup
  components/        Nav, Stairs, ScrollReset, PageHead, NewsletterField, Duotone
  sections/          Hero, Intro, Services, Approach, Work, Team, Footer
  pages/             Archive, TeamPage, Apply
api/
  subscribe.ts       POST { email } → Brevo contact; honeypot + rate limit
  subscribe.test.mts assert-based self-check, stubs fetch
public/
  fonts/             CormorantGaramond-var, MartianMono-400
  team/              9 real member portraits
  img/               banners (archive/team/joinus), logo_dark, ex1–ex3
                     (Services plates), p1–p5 placeholders
  newsletter/2026/   june-2026.html + .pdf — the published issue
```

Home section order: Hero → Intro → Services → Approach → Work → Team → Footer.

Routes (`App.tsx`, react-router): `/` · `/archive` · `/team` · `/apply`,
anything else falls back to home. Every sub-page opens with `PageHead`; the
Footer sits outside `<Routes>` and shows on all of them.

Each file starts with a banner comment naming the part of the page it draws —
grep `section N of 6` to jump to a home section.

`design.md` is the design system — palette, type scale, grid, motion
grammar, component inventory, and the gotchas list. Read it before changing
anything visual.

## Working rules

- **Copy goes in `content.ts`, never inline in a component.** The only
  exception is the hero's two wordmark lines.
- **One easing curve** — `cubic-bezier(0.4, 0, 0.2, 1)`, which is also
  Tailwind's default. Never add a bounce or elastic ease.
- **The palette is closed.** 13 Ohio State values, all defined. Use an unused
  token before inventing one.
- **Never fade scarlet for small text** — it falls under WCAG AA. Use
  `gray-dark-40` for de-emphasis. See design.md §2.
- Every reveal respects `prefers-reduced-motion`.
- Transition specific properties, not `all`.
- Ask before adding a dependency.
- **Anything animating above the fold waits on `curtainGone`** (from
  `lib/anim.ts`), never a guessed `delay:` — the Stairs curtain covers the
  first ~2.2s.
- **Newsletter issues are hand-built HTML** under `public/newsletter/`, not
  React. Their stylesheet mirrors the site's tokens by hand — same palette,
  same two fonts (self-hosted from `/fonts/`), flat and square, one easing
  curve. Keep the `@media print` block working: it produces the PDF.
- Verify visually. `npm run dev` then screenshot in headless Chrome —
  several bugs here (blanked paragraphs, glued words, unreadable contrast)
  passed both build and lint and were only visible in a render. For *motion*,
  drive a real clock over CDP; `--virtual-time-budget` distorts GSAP timing
  badly enough to show the wrong frame or none at all.

## Traps

Full list with explanations in design.md §7. The short version:

1. `splitChars` / `splitWords` rebuild an element from its `textContent`.
   Nested markup inside a split target is destroyed — one element per line.
2. StrictMode double-invokes effects; DOM-rewriting splitters need guards.
3. Tailwind v4 emits `rotate-45` as the standalone `rotate` property, so
   `getComputedStyle(...).transform` reads `none`. Not a bug.
4. ScrollTrigger caches positions at creation and this page grows after
   load — see Known issues.
5. `gsap.from()` takes the element's current state as its *endpoint*, so
   StrictMode's killed first timeline leaves it animating 0 → 0. Use `fromTo`
   on anything paused at load.
6. `.word` is an overflow-hidden mask; 3D rotation inside one is cropped flat.
7. Grid auto-placement is **sparse**: an item with an explicit `col-start`
   behind the cursor is pushed to a new row. Left-hand items must come first
   in the DOM — `order-*` reorders placement but does not rewind the cursor.
   See the Archive cover (`pages/Archive.tsx`).
8. A stretched `<button>` centres its content box vertically whatever its
   `display`. Team cards need `flex flex-col` on the shell, or a short card
   floats mid-row.
9. `Duotone`'s `ditherWidth` above the plate's on-screen width makes the
   browser downscale 1-bit art; the interference reads as harsh noise. Match
   it to the rendered size.

## Backend — the subscribe endpoint

`POST /api/subscribe { email, company }` → Brevo `POST /v3/contacts` with
`updateEnabled: true`, so a returning address re-lists instead of erroring.

- Env: `BREVO_API_KEY`, `BREVO_LIST_ID` (comma-separated ids; the live list
  is **5**). Both in `.env.local` (gitignored) and in Vercel's env vars.
- `company` is a honeypot — hidden from people, so anything in it is a bot.
  The handler answers `200` and sends nothing to Brevo.
- Rate limit: 5 per IP per 10 min, 60 per instance. **In-memory**, so it only
  covers one warm lambda — marked with a `ponytail:` comment. Vercel's
  firewall or Turnstile is the next rung if it draws real traffic.
- `NewsletterField` reports the result in a native `<dialog>` (Escape, focus
  trap and backdrop come free) and keeps the hint line as a quieter echo.

## Current state

Built and working: all seven home sections plus three sub-pages, Stairs load
curtain, sliding staircase, hover-expand accordion, tilted cards that
straighten at viewport centre, team grid with expandable bios, dithered
duotone hero with flip-board wordmark, sub-page banners (photo + dither,
panel drop → scramble headline → line wipe → page rises), dotted "coming
soon" issue plates, three-plate overlapping collage in Services, mobile
hamburger menu, centre-out hover fills on the nav, working newsletter signup,
and the June issue online at `/newsletter/2026/june-2026.html`.

Builds and lints clean; `node api/subscribe.test.mts` passes.

## Known issues / next up

- [ ] **ScrollTrigger drift** — reveals fire early because start/end pixel
      offsets are cached before webfonts and canvases settle. Fix is
      `ScrollTrigger.refresh()` on `document.fonts.ready`, `window.load`, and
      a body `ResizeObserver`. Was implemented once, currently not in tree.
- [ ] **Mobile** — home, /team and /archive checked at 390px; /apply and the
      newsletter issue below 640px are still unverified.
- [ ] **Leftover agency links** — Services' "View all services" and Work's
      "View all projects" point at anchors that go nowhere.
- [ ] **Placeholder images** — `public/img/p1–p5.jpg` are Picsum stock; only
      the June cover still uses one.
- [ ] **Issue HTML is 1.3 MB** — six inline base64 images. Extract them to
      `public/img/` before the archive grows.
- [ ] Two team portraits are non-square and rely on a `focus` crop hint;
      proper square headshots would read better at 112px.
- [ ] Nothing on `/team` links to `/apply` any more — only the nav does.
- [ ] Unused: `src/assets/hero.png`, `public/favicon.svg`, and the three.js
      dependency set.
- [ ] No OG work. Favicon is deliberately blank (`data:` icon in
      `index.html`).

## Progress log

Append one line per session: date — area — what landed.

- 2026-07-30 — setup — Vite/React/TS scaffold, Tailwind v4, deps
- 2026-07-30 — build — full single-page site from design.md; verified in headless Chrome
- 2026-07-30 — restructure — donor section order, 6/12 grid, char + line splitting; fixed 2 StrictMode text bugs
- 2026-07-30 — video pass — grid rules, stairs block, accordion, tilt cards, photo duotone
- 2026-07-30 — section pass — dither restored on hero, stepped block rebuilt
- 2026-07-30 — palette — Ohio State scarlet/gray, muted-text contrast fixed
- 2026-07-30 — team — Testimonials replaced with 3×3 Team grid
- 2026-07-31 — content — real team photos wired, hero to single line, nav links centred, hero newsletter field
- 2026-07-31 — type — Switzer replaced with Cormorant Garamond; text scale +10%, tracking loosened
- 2026-07-31 — motion — SplitText ink-bleed on intro copy; hover padding + hover-expand + rotating `+` on services
- 2026-07-31 — docs — design.md and CLAUDE.md rewritten for OFF; noted ScrollTrigger drift as outstanding
- 2026-08-01 — team — /team grid to 5 columns; bio modal replaced with full-row expansion strip (MemberModal deleted)
- 2026-08-01 — banners — photo backgrounds + faint dither on /archive, /team, /apply mastheads; PageHead load sequence (panel drops, text line-wipes, page rises), gated on the Stairs curtain via `curtainGone`
- 2026-08-01 — motion — banner headlines scramble (ScrambleTextPlugin); hero wordmark flips word by word; Approach cards straighten at viewport centre; unpublished issue plates cycle "Coming up soon!" against their due month
- 2026-08-02 — mobile — hamburger menu below md; Approach scatter offset scoped to lg; /team two columns; Work two columns; card rows top-aligned (stretched-button centring)
- 2026-08-02 — nav — centre-out white fill on hover for section links and Apply, arrow that grows the Apply button, mark rotates and magnifies
- 2026-08-02 — services — single plate replaced with three overlapping duotone/dither plates (ex1–ex3), staggered entry + scrubbed drift; Lenis to a heavier glide
- 2026-08-02 — backend — Brevo signup wired (`api/subscribe.ts`), result modal, honeypot + per-IP rate limit, dev-only Vite middleware so `/api` works in `npm run dev`
- 2026-08-02 — newsletter — June issue published under `public/newsletter/2026/`; its stylesheet rebuilt on the site's tokens; /archive links to the HTML and offers a direct PDF download
- 2026-08-02 — work — June cover on the Work card, whole card links to the issue, arrow plate in the cover's bottom-left that widens on hover; real Instagram/LinkedIn URLs in the footer
- 2026-08-03 — polish — newsletter covers show as plain photos (duotone dropped on Work + /archive); sub-page headlines type out instead of scrambling; Services heading is one centred line on the standard char reveal (spread scrub removed); staircase rects bleed 1px to kill a device-only seam; mobile Apply moved from the bar into the hamburger drawer
