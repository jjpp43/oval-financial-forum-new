# Oval Financial Forum — site

Marketing site for OFF, an Ohio State student organisation that publishes a
monthly financial newsletter. Single page, no router.

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

Commands: `npm run dev`, `npm run build`, `npm run lint` (oxlint).

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
public/
  fonts/             CormorantGaramond-var, MartianMono-400
  team/              9 real member portraits
  img/               banners (archive/team/joinus), logo_dark, p1–p5 placeholders
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

## Current state

Built and working: all seven home sections plus three sub-pages, Stairs load
curtain, sliding staircase, hover-expand accordion, tilted cards that
straighten at viewport centre, team grid with expandable bios, dithered
duotone hero with flip-board wordmark, sub-page banners (photo + dither,
panel drop → scramble headline → line wipe → page rises), dotted "coming
soon" issue plates, newsletter fields (non-functional).

Builds and lints clean.

## Known issues / next up

- [ ] **ScrollTrigger drift** — reveals fire early because start/end pixel
      offsets are cached before webfonts and canvases settle. Fix is
      `ScrollTrigger.refresh()` on `document.fonts.ready`, `window.load`, and
      a body `ResizeObserver`. Was implemented once, currently not in tree.
- [ ] **Mobile untested** below 1024px.
- [ ] **Newsletter forms post nowhere** — both `preventDefault` only.
- [ ] **Leftover agency links** — Services' "View all services" and Work's
      "View all projects" point at anchors that go nowhere.
- [ ] **Placeholder images** — `public/img/p1–p5.jpg` are Picsum stock; only
      the June cover still uses one.
- [ ] Two team portraits are non-square and rely on a `focus` crop hint;
      proper square headshots would read better at 112px.
- [ ] Nothing on `/team` links to `/apply` any more — only the nav does.
- [ ] Unused: `src/assets/hero.png`, `public/favicon.svg`, and the three.js
      dependency set.
- [ ] No OG work, no deploy target. Favicon is deliberately blank (`data:`
      icon in `index.html`).

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
