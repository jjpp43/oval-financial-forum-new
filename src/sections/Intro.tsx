import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
import { intro } from "../content";

/* ===========================================================================
 * THE RECTANGLES — edit this table, nothing else.
 *
 * The band behind them is SOLID BLUE and never moves. The rectangles are
 * BONE (the page background colour) and are anchored to the LEFT edge. They
 * slide in from off-screen left and cut into the blue, so the blue block
 * ends up with a staircase edge descending to the right.
 *
 * Every rectangle slides in from off-screen left. `delay` is seconds after
 * the section is scrolled into view.
 *
 *   screen left                                          screen right
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │                    (no rectangle — solid blue)                │  R1
 *   │████ R2 w17 ▶│                                                 │
 *   │████████ R3 w34 ────▶│                                         │
 *   │████████████ R4 w50 ───────▶│                                  │
 *   └───────────────────────────────────────────────────────────────┘
 *     ↑ bone rectangles, each wider than the last
 *
 * width    : % of viewport width the BONE rectangle covers, from the left.
 *            0 = no rectangle on that row (stays fully blue).
 *            67 = bone covers the left two-thirds, blue shows on the right.
 * delay    : seconds. Raise it to make that rectangle arrive later.
 * duration : seconds of travel.
 * from     : how far left it starts, in multiples of viewport width.
 *            1 = just off-screen. 2 = starts twice as far out (arrives faster
 *            looking, since it covers more ground in the same duration).
 * ease     : any GSAP ease string.
 *
 * Add or remove rows freely — the band divides its height evenly between them.
 * =========================================================================== */
const RECTANGLES = [
  { width: 0, delay: 0.0, duration: 0.8, from: 1, ease: "power3.out" }, // R1
  { width: 17, delay: 0.0, duration: 0.8, from: 1, ease: "power3.out" }, // R2
  { width: 34, delay: 0.09, duration: 0.8, from: 1, ease: "power3.out" }, // R3
  { width: 50, delay: 0.18, duration: 0.8, from: 1, ease: "power3.out" }, // R4
];

/** Height of the stepped band. Bump these to make the staircase taller. */
const BAND_HEIGHT = "h-[22vh] lg:h-[30vh]";

/** Copy fades in this many seconds after the first rectangle starts. */
const COPY_DELAY = 0.25;

/* =============================================================================
 * HOME · section 2 of 6 — INTRO / "Who we are"
 * The scarlet statement band with the stepped bottom edge. Copy: `intro`.
 * ========================================================================== */
export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });

      // staircase is scrubbed: rectangles track scroll position from the band
      // entering the viewport until it reaches the middle of the screen
      const bandTl = gsap.timeline({
        scrollTrigger: {
          trigger: band.current,
          start: "top bottom",
          end: "top 50%",
          scrub: 0.5,
        },
      });

      // one tween per rectangle, so each keeps its own delay/duration/ease
      RECTANGLES.forEach((r, i) => {
        if (r.width === 0) return;
        bandTl.fromTo(
          `#rect-${i + 1}`,
          { x: () => -window.innerWidth * r.from },
          { x: 0, duration: r.duration, ease: r.ease },
          r.delay, // absolute position on the timeline
        );
      });

      // eyebrow keeps the plain rise
      tl.fromTo(
        ".slab-copy",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        COPY_DELAY,
      );

      // statement + note bleed outward from their own middle, like ink on
      // paper. Split per element so each radiates from its own centre
      // rather than the pair sharing one sequence.
      gsap.utils.toArray<HTMLElement>(".ink-text").forEach((node, i) => {
        const split = SplitText.create(node, { type: "words" });
        splits.push(split);
        tl.from(
          split.words,
          {
            opacity: 0,
            scale: 0,
            filter: "blur(4px)",
            stagger: { each: 0.03, from: "center" },
            duration: 1,
            ease: "power2.out",
          },
          COPY_DELAY + i * 0.15,
        );
      });
    }, el);

    return () => {
      ctx.revert();
      // SplitText markup is not owned by the context — put the DOM back
      splits.forEach((sp) => sp.revert());
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden">
      {/* solid body, copy sits top-right */}
      <div className="grid-page bg-scarlet px-6 pt-28 text-white lg:px-15 lg:pt-8 lg:pb-4">
        <p className="slab-copy label text-label-m col-span-6 opacity-50 lg:col-span-4">
          {intro.eyebrow}
        </p>
        <p className="ink-text label text-label-m col-span-3 mt-10 leading-relaxed lg:col-span-3 lg:col-start-7 lg:mt-0">
          {intro.statement}
        </p>
        <p className="ink-text label text-label-s col-span-3 mt-10 leading-relaxed lg:col-span-3 lg:col-start-10 lg:mt-0">
          *{intro.note}
        </p>
      </div>

      {/* stepped bottom edge — one row per rectangle */}
      <div
        ref={band}
        aria-hidden
        className={`flex w-full flex-col bg-scarlet ${BAND_HEIGHT}`}
      >
        {RECTANGLES.map((r, i) => (
          // no clipping per row — the section already clips, and a rect that
          // stops exactly on the row edge leaves a scarlet hairline on devices
          // that round transformed layers differently from their parent
          <div key={i} className="relative w-full flex-1">
            {r.width > 0 && (
              <div
                id={`rect-${i + 1}`}
                className="absolute top-0 -bottom-px left-0 bg-gray-light-90"
                style={{ width: `${r.width}%` }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
