import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { approach } from "../content";
import { splitChars } from "../lib/anim";

// scattered placement + tilt per card, mirroring the donor's loose stack
// scatter is horizontal only — the gap between cards is uniform (flex gap
// below), so the stack reads as an even rhythm
const PLACEMENT = [
  { rotate: -1.5, x: "6%" },
  { rotate: 2.5, x: "22%" },
  { rotate: -2, x: "2%" },
  { rotate: 1.5, x: "18%" },
];

/* =============================================================================
 * HOME · section 4 of 6 — APPROACH / "How we bring each issue"
 * Looping video behind a wash, headline left, four tilted step cards stacked
 * right on a dashed curve. Each card straightens as it reaches the middle of
 * the screen. Copy: `approach` in content.ts.
 * ========================================================================== */
export default function Approach() {
  const root = useRef<HTMLElement>(null);
  const curve = useRef<SVGSVGElement>(null);
  // a looping background is motion too — hold the first frame if asked to
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const heading = el.querySelector<HTMLElement>(".approach-title");
    if (!heading) return;

    const chars = splitChars(heading);
    const clip = el.querySelector<SVGRectElement>(".curve-clip");
    const path = el.querySelector<SVGPathElement>(".curve-path");

    // Card heights follow their copy, so the curve is measured rather than
    // hand-drawn: it runs through the centre of every card, and the SVG is
    // unscaled (no viewBox) so one user unit is one pixel.
    const layout = () => {
      const svg = curve.current;
      if (!svg || !path) return;
      const box = svg.getBoundingClientRect();
      const centres = [...el.querySelectorAll<HTMLElement>(".tilt-card")].map(
        (c) => {
          const r = c.getBoundingClientRect();
          return {
            x: r.left - box.left + r.width / 2,
            y: r.top - box.top + r.height / 2,
          };
        },
      );
      if (!centres.length) return;

      // tails above the first card and below the last, so the line enters and
      // leaves the column instead of starting mid-air
      const pts = [
        { x: centres[0].x, y: 0 },
        ...centres,
        { x: centres[centres.length - 1].x, y: box.height },
      ];

      // Catmull-Rom through every point, converted to cubic beziers
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        d +=
          ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6},` +
          ` ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6},` +
          ` ${p2.x} ${p2.y}`;
      }
      path.setAttribute("d", d);
      clip?.setAttribute("width", String(box.width + 200));
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clip?.setAttribute("height", "10000");
      return () => ro.disconnect();
    }

    // curve draws itself as the card column passes through the viewport
    const draw = gsap.to(clip, {
      attr: {
        height: () => curve.current?.getBoundingClientRect().height ?? 0,
      },
      ease: "none",
      scrollTrigger: {
        trigger: curve.current,
        start: "top 85%",
        end: "bottom 60%",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    const reveal = gsap.fromTo(
      chars,
      { yPercent: 100, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.018,
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      },
    );

    // entry keeps the tilt the inline style already set — rotation belongs to
    // the straighten scrub below, and two tweens writing it would fight
    const cardEls = el.querySelectorAll<HTMLElement>(".tilt-card");
    const cards = gsap.fromTo(
      cardEls,
      { y: 60, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 65%", once: true },
      },
    );

    // each card unwinds to level as it travels up to the middle of the screen
    const straighten = Array.from(cardEls).map((card, i) =>
      gsap.fromTo(
        card,
        { rotate: PLACEMENT[i % PLACEMENT.length].rotate },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "center center",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      ),
    );

    return () => {
      reveal.scrollTrigger?.kill();
      reveal.kill();
      cards.scrollTrigger?.kill();
      cards.kill();
      straighten.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      draw.scrollTrigger?.kill();
      draw.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={root}
      id="approach"
      className="grid-page relative isolate overflow-hidden px-6 pt-24 pb-32 lg:px-15 lg:pt-40 lg:pb-24"
    >
      {/* Background loop. The wash over it keeps scarlet type above AA — the
          raw footage is far too busy to read against. Masked top and bottom so
          it dissolves into the page instead of ending on a hard seam. */}
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
        src="/video/approach.mp4"
        autoPlay={!still}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gray-light-90/88" />

      <h2 className="approach-title text-display-l col-span-6 font-semibold max-w-[12ch] lg:col-span-5">
        {approach.headline}
      </h2>

      <p className="label text-label-s col-span-6 mt-10 text-gray-dark-40 lg:col-span-3 lg:mt-20"></p>

      <div className="relative isolate col-span-6 mt-12 flex flex-col gap-12 lg:col-span-6 lg:col-start-7 lg:mt-0">
        {/* loose curve behind the stack, measured through the card centres in
            layout(). The clip rect grows on scroll — a dashed stroke can't
            also be draw-on animated with dashoffset, the dashes have it. */}
        <svg
          ref={curve}
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full overflow-visible"
        >
          <clipPath id="approach-curve-clip">
            <rect className="curve-clip" x="-100" y="0" width="0" height="0" />
          </clipPath>
          <path
            className="curve-path"
            fill="none"
            stroke="var(--color-gray-dark-40)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="0 12"
            clipPath="url(#approach-curve-clip)"
          />
        </svg>

        {/* ---- the four step cards ---------------------------------------- */}
        {approach.steps.map((s, i) => {
          const p = PLACEMENT[i % PLACEMENT.length];
          return (
            <div
              key={s.title}
              // the scatter offset only exists from lg up — narrow columns have
              // no room for it, and the section clips whatever hangs off
              className="tilt-card ml-0 w-full max-w-[26rem] lg:ml-[var(--card-x)]"
              style={
                {
                  transform: `rotate(${p.rotate}deg)`,
                  "--card-x": p.x,
                } as CSSProperties
              }
            >
              <div className="flex items-baseline justify-between">
                <span className="text-heading font-semibold">{s.title}</span>
                <span className="text-heading font-semibold opacity-80">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="label text-label-s mt-5 leading-relaxed text-gray-dark-40">
                {s.body}
              </p>
              <div className="mt-6 border-t border-scarlet/30" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
