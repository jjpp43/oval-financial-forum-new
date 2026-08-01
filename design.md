# design.md — Oval Financial Forum

Design system for the OFF site. Every token below is the live value in
`src/index.css` `@theme` — change it there, not here, then update this file.

**Origin.** The layout system was reverse-engineered from
`oci.madebybuzzworthy.com` (Outsource Consultants, by Buzzworthy Studio) via
HAR capture: the 12-column grid, the vertical rhythm, the single easing
curve, the stepped block, the dithered duotone hero, the split-word reveals.
The palette and typeface are ours — Ohio State brand scarlet and Cormorant
Garamond — so the site no longer resembles the donor. Treat the donor as a
structural reference that has already been absorbed, not something to keep
matching.

---

## 1. What carries the design

Four moves. Everything else is restraint.

1. **Scarlet at full-bleed scale.** Not a button accent — whole sections of
   it, and the duotone treatment on every photograph. The contrast between
   the near-white ground and the scarlet blocks *is* the composition.
2. **Enormous vertical spacing.** Section padding runs 150–400px. If a
   section feels too empty, it is probably correct.
3. **Serif display against mono labels.** Cormorant Garamond set huge,
   Martian Mono set tiny and uppercase. The size and voice contrast does the
   work; there is no third typeface and no decoration.
4. **One easing curve, everywhere.** `cubic-bezier(0.4, 0, 0.2, 1)`. No
   bounce, no elastic, no per-component exceptions.

---

## 2. Color — Ohio State brand palette

### Primary

| Name | Hex | Token | Role here |
|------|-----|-------|-----------|
| Scarlet (PMS 200) | `#ba0c2f` | `--color-scarlet` | full-bleed blocks, display type, buttons, duotone shadow |
| Gray (PMS 429) | `#a7b1b7` | `--color-gray` | reserved — unused |
| White | `#ffffff` | `--color-white` | type on scarlet, tilt cards, MENU button |

### Scarlet shades

| Name | Hex | Token | Role |
|------|-----|-------|------|
| Scarlet Dark 40 | `#70071c` | `--color-scarlet-dark-40` | unused |
| Scarlet Dark 60 | `#4a0513` | `--color-scarlet-dark-60` | unused |

### Gray tints

| Name | Hex | Token | Role |
|------|-----|-------|------|
| Gray Light 20 | `#bfc6cb` | `--color-gray-light-20` | unused |
| Gray Light 40 | `#cfd4d8` | `--color-gray-light-40` | unused |
| Gray Light 60 | `#dfe3e5` | `--color-gray-light-60` | unused |
| Gray Light 80 | `#eff1f2` | `--color-gray-light-80` | unused |
| Gray Light 90 | `#f6f7f8` | `--color-gray-light-90` | **page background**, duotone highlight, stepped rectangles |

### Gray shades

| Name | Hex | Token | Role |
|------|-----|-------|------|
| Gray Dark 20 | `#868e92` | `--color-gray-dark-20` | unused |
| Gray Dark 40 | `#646a6e` | `--color-gray-dark-40` | **muted small text on light sections** |
| Gray Dark 60 | `#3f4443` | `--color-gray-dark-60` | unused |
| Gray Dark 80 | `#212325` | `--color-gray-dark-80` | reserved for a dark ground |

### Rules

- **Never fade scarlet for small text.** Scarlet on `gray-light-90` is about
  5.9:1 — fine at full opacity. At `opacity-40/70` it drops near 3:1, under
  WCAG AA. For de-emphasis use `gray-dark-40` (~5.6:1) at full opacity.
  This bit us once; the light sections were rewritten to fix it.
- **On scarlet, type is white**, never a gray tint — the tints are too close
  in value to hold at small sizes.
- The palette is closed. Reach for an unused token before inventing a value.

---

## 3. Type

Two families, self-hosted as woff2 in `public/fonts/`.

| Role | Face | File | Size |
|------|------|------|------|
| Display + body | **Cormorant Garamond** (OFL, variable 300–700) | `CormorantGaramond-var.woff2` | 37 KB |
| Labels, numbers, eyebrows | **Martian Mono** (OFL) | `MartianMono-400.woff2` | 10 KB |

Only the Cormorant file is preloaded in `index.html`.

### Cormorant's two consequences

It is a high-contrast old-style serif and it replaced a neo-grotesk
(Switzer). Two settings had to move and must not be reverted:

- **Text sizes run ~10% larger.** Cormorant's x-height is small; identical px
  values read smaller and thinner. Body copy was too weak at the old scale.
- **Tracking is looser.** Display was `-0.05em` for the grotesk; on Cormorant
  that jams the serifs together. Now `-0.02em` and up.

### Scale

Display sizes are **viewport-relative**, text sizes are **fixed rem** —
headlines scale with the screen, body copy never does.

| Token | Value | Line-height | Tracking |
|-------|-------|-------------|----------|
| `--text-hero` | `clamp(3.25rem, 8vw + 0.5rem, 10rem)` | 0.9375 | −0.01em |
| `--text-display-xl` | `clamp(3.5rem, 3.8835vw + 2rem, 18.75rem)` | 0.83 | −0.02em |
| `--text-display-l` | `clamp(2.5rem, 2.08333vw + 1.5rem, 8.125rem)` | 0.9 | −0.02em |
| `--text-display-m` | `clamp(2rem, 1.11111vw + 1.25rem, 4.5rem)` | 0.94 | −0.015em |
| `--text-heading` | `1.875rem` | 1.15 | −0.005em |
| `--text-body-l` | `1.375rem` | 1.5 | 0 |
| `--text-body` | `1.25rem` | 1.55 | 0 |
| `--text-body-s` | `1.125rem` | 1.6 | 0 |
| `--text-label` | `0.75rem` | 1.2 | +0.05em |
| `--text-label-s` | `0.6875rem` | 1.2 | +0.05em |

Sub-1.0 line-height on display type is deliberate — lines nearly touch.

**Mono labels are the only uppercase.** Use the `label` utility, which sets
family, tracking, and `text-transform` together.

---

## 4. Grid + spacing

```
Columns:  6 (mobile) → 12 (≥1024px)
Gutter:   40px → 50px → 60px
Inset:    px-6 mobile, px-15 (60px) desktop
```

Applied through the `grid-page` utility.

**Breakpoints, three only:** 0 / 640 / 1024.

**Vertical rhythm:** section padding 150–400px; gaps between sections are
3–5× anything inside one.

---

## 5. Motion

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

Durations: `0.2s` / `0.3s` / `0.5s` for UI, `0.7–0.9s` for scroll reveals.
Tailwind's default timing function is already this curve, so `transition-*`
utilities need no override.

### Reveal toolkit — `src/lib/anim.ts`

| Export | Effect | Used by |
|--------|--------|---------|
| `splitWords` | wraps each word in an overflow-hidden mask | `useWordReveal`, `useLineReveal` |
| `splitChars` | per-character spans, words kept unbreakable | Services, Approach, Work, `useCharReveal` |
| `splitLines` | rebuilds an element as one mask per rendered line | `PageHead`, `useLineReveal` |
| `useWordReveal` | word masks rise | — (available) |
| `useCharReveal` | per-char translate + rotate | Team headline |
| `useLineReveal` | measures rendered line boxes, masks per line | — (available) |
| `useRise` | fade + 32px rise | — (available) |
| `useLenis` | smooth scroll wired to GSAP's ticker | `App.tsx` |
| `curtainGone` | promise resolved when the load curtain clears | `Hero`, `PageHead` |
| `liftCurtain` | resolves the above | `Stairs` |

**Anything animating above the fold must await `curtainGone`.** The Stairs
curtain runs ~2.2s; a plain `delay:` guess plays the reveal behind the panels
where nobody sees it. Later route changes see the promise already resolved and
start immediately.

GSAP plugins registered in `anim.ts`: `ScrollTrigger` and `ScrambleTextPlugin`
(both bundled free with GSAP 3.13+).

`SplitText` (bundled free with GSAP 3.13+) is used directly in `Intro.tsx`
for the ink-bleed effect — words radiate from each paragraph's own centre
with `stagger: { each: 0.03, from: "center" }`, plus scale and blur. Split
per element, and `split.revert()` on unmount because `gsap.context()` does
not own the DOM SplitText injects.

### Signature moments

- **Stairs curtain** (`Stairs.tsx`) — six panels cover the viewport on load,
  then lift in a staggered staircase.
- **Sliding rectangles** (`Intro.tsx`) — long horizontal bone bars slide in
  from the left over a solid scarlet band, each shorter than the last, so a
  descending staircase edge assembles top-to-bottom. Table-driven; see the
  `RECTANGLES` block with its ASCII diagram at the top of that file.
- **Dithered duotone hero** — photo → Rec. 709 luma → 8×8 Bayer threshold →
  two colours, upscaled with `image-rendering: pixelated`.
- **Flip-board wordmark** (`Hero.tsx`) — each word of the hero title swings
  down on its top edge: `rotationX -90 → 0`, `transformOrigin: 50% 0%`,
  0.14s apart. Needs `perspective` on the *line*, and `.hero-title .word`
  overrides the mask's `overflow: hidden` or the rotation is cropped flat.
- **Sub-page banner sequence** (`PageHead.tsx`) — one paused timeline:
  the scarlet panel drops in as a solid block (`yPercent -100 → 0`), the
  headline decodes word by word with ScrambleText (first word lands plain,
  anchoring the line), eyebrow and intro wipe up per line, then everything
  below the banner rises. Plays on `curtainGone`.
- **Cards straightening at centre** (`Approach.tsx`) — each step card scrubs
  its own tilt to `rotate: 0` between `top 85%` and `center center`.
- **Unpublished issue plates** (`Work.tsx`) — the `.dot-grid` field with a
  label that scrambles between "Coming up soon!" and the month the issue is
  due, offset per card so the three never move in unison. Paused off screen.

### Hover grammar

Team cards and services rows share one idiom: **left padding opens up on
hover**, transitioned on `padding-left` only — never `all`, which would make
the colour swaps mushy. Services rows expand on hover (and on focus and
click, so keyboard and touch still work); the `+` rotates 45° rather than
swapping to `×`.

`prefers-reduced-motion` zeroes transition durations inside `.team-card` and
`.service-row`, and every scroll reveal early-returns.

### Scroll triggers

Currently `top 75%` – `top 90%` per section. See §8 — these drift and fire
early.

---

## 6. Components

| File | Purpose |
|------|---------|
| `components/Nav.tsx` | fixed scarlet bar: crosshair `Mark` + wordmark, centred route links, white Apply button |
| `components/Stairs.tsx` | load-in curtain; resolves `curtainGone` when it clears |
| `components/ScrollReset.tsx` | jumps to top and refreshes ScrollTrigger on route change |
| `components/PageHead.tsx` | scarlet masthead every sub-page opens with. Optional `bg` photo under a dither plate and two scarlet washes |
| `components/NewsletterField.tsx` | the subscribe field, shared by hero and footer. `inputFill` tints the box (hero uses `bg-scarlet/50`) |
| `components/Duotone.tsx` | photo → two-tone canvas. Props: `dither` for the Bayer treatment, `ditherWidth` for dot size, `gamma` for midtones, `style` for `object-position` |
| `sections/Hero.tsx` | dithered plate, flip-board wordmark, tagline, subscribe field |
| `sections/Intro.tsx` | scarlet band, ink-bleed copy, sliding staircase |
| `sections/Services.tsx` | split heading, hover-expand accordion |
| `sections/Approach.tsx` | video ground, tilted process cards on a dashed curve |
| `sections/Work.tsx` | issue row — one duotone cover, three dotted "coming soon" plates |
| `sections/Team.tsx` | member grid (3 cols on home, 5 on `/team` via `bare`), expandable bio strip |
| `sections/Footer.tsx` | dark ground, logo, subscribe field, legal + social row |
| `pages/Archive.tsx` · `pages/TeamPage.tsx` · `pages/Apply.tsx` | the three sub-pages, each opening with `PageHead` |

All copy lives in `src/content.ts`. Nothing is hardcoded in components except
the hero's two wordmark lines.

---

## 7. Gotchas that cost time

1. **`splitChars` destroys nested markup.** It reads `textContent` and
   rebuilds the node, so `<br>`, `<em>`, `&nbsp;` inside a `.hero-title`
   vanish before first paint. Use one element per line instead.
2. **React StrictMode double-invokes effects.** Any splitter that rewrites
   the DOM needs a guard, or the second pass re-splits already-split markup.
   `useLineReveal` stashes the pristine string in `data-source` for exactly
   this reason — reading `textContent` back off built masks concatenates
   block spans with no separator and glues words together across line breaks.
3. **Tailwind v4 emits `rotate-45` as the standalone `rotate` property,** not
   `transform: rotate()`. `getComputedStyle(...).transform` returns `none`
   and looks like a failure. `transition-transform` covers `transform,
   translate, scale, rotate`, so it animates fine.
4. **Non-square portraits need a focal point.** Team members carry an
   optional `focus` field mapped to `object-position`; square sources ignore
   it.
5. **Procedural imagery does not read as photography.** Two attempts at
   generating architecture with sine fields produced moiré, then chevrons.
   The duotone/dither pipeline over a real photo is the technique that works.
6. **`gsap.from()` plus StrictMode leaves elements invisible.** `from()` reads
   the element's *current* values as its endpoint. StrictMode kills the first
   timeline with the targets parked at the start state (`opacity: 0`), so the
   second timeline animates 0 → 0. Use `fromTo` for anything on a paused
   load timeline — this cost an hour on the hero wordmark.
7. **Word masks crop 3D rotation.** `.word` is `overflow: hidden` for the
   line reveal; any `rotationX` inside one flattens to a vertical squash
   until the overflow is restored.
8. **Headless `--virtual-time-budget` distorts GSAP timing.** Screenshots of
   load sequences land at the wrong moment or never advance. Verify motion on
   a real clock over CDP instead (navigate, wait, `Page.captureScreenshot`).

---

## 8. Known issues

- **ScrollTrigger positions drift.** Start/end are cached as pixel offsets at
  creation and the page grows afterward — webfont swap, canvas decode,
  SplitText rewrap. Reveals fire early as a result (measured firing at 90% of
  viewport height while configured for 75%). Fix is `ScrollTrigger.refresh()`
  on `document.fonts.ready`, `window.load`, and a body `ResizeObserver`. This
  was implemented once and is **not currently in the tree**.
- Mobile below 1024px is untested.
- Both newsletter forms (hero + footer) `preventDefault` and post nowhere.
- `public/img/p1–p5.jpg` are Picsum placeholders used by Hero, Services, Work.
- Leftover agency copy: Services' "View all services" and Work's "View all
  projects" both point at anchors that go nowhere.
- Nothing on `/team` links to `/apply` any more — only the nav does.
- `public/favicon.svg` is unreferenced; `index.html` ships a blank
  `data:` icon on purpose.
- `src/assets/hero.png` is unused.
