import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
import { intro } from "../content";

/** Six equal 1/6-width steps, matching the splash screen's six columns. */
const STAIR_WIDTHS = Array.from(
  { length: 6 },
  (_, i) => ((6 - i) / 6) * 100,
);
/** Use 101 instead to make the bars enter from the right. */
const STAIR_FROM = -101;

/**
 * Scarlet bars assemble horizontally from longest to shortest. Once the full
 * stair is visible, they leave upward in the same order and expose the page
 * ground beneath them.
 */
const BAND_HEIGHT = "h-[16vh] lg:h-[20vh]";

/* =============================================================================
 * HOME · section 2 of 6 — INTRO / "Who we are"
 * Editorial manifesto on scarlet, followed by the stepped bottom edge.
 * Copy: `intro`.
 * ========================================================================== */
export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stairBars = el.querySelectorAll<HTMLElement>(".intro-stair");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(stairBars, { autoAlpha: 1 });
      return () => gsap.set(stairBars, { clearProps: "opacity,visibility" });
    }

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const eyebrow = el.querySelector<HTMLElement>(".intro-eyebrow");
      const statement = el.querySelector<HTMLElement>(".intro-statement");
      const rule = el.querySelector<HTMLElement>(".intro-rule");
      const note = el.querySelector<HTMLElement>(".intro-note");
      if (!eyebrow || !statement || !rule || !note) return;

      const split = SplitText.create(statement, {
        type: "lines",
        mask: "lines",
        linesClass: "intro-line",
      });
      splits.push(split);

      // Every bar starts hidden in the HTML. Park all of them off-screen
      // before making them visible; a staggered fromTo only applies its first
      // target immediately and lets the delayed targets flash at x: 0.
      gsap.set(stairBars, { xPercent: STAIR_FROM, autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });

      // One editorial sequence: index, manifesto, rule, then supporting line.
      tl.fromTo(
        eyebrow,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
      )
        .fromTo(
          split.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
          },
          "-=0.18",
        )
        .fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.7,
            transformOrigin: "0% 50%",
            ease: "power3.out",
          },
          "-=0.35",
        )
        .fromTo(
          note,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.4",
        );

      // Two-phase transition: first construct the stair from the left, then
      // lift the connected assembly through the band. Moving one group keeps
      // the rows touching, so no white seams open between blocks.
      const stairTl = gsap.timeline({
        scrollTrigger: {
          trigger: band.current,
          start: "top bottom",
          end: "bottom 20%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      stairTl
        .to(stairBars, {
          xPercent: 0,
          duration: 1,
          stagger: 0.1,
          ease: "none",
        })
        .to(
          el.querySelector(".intro-stair-group"),
          {
            yPercent: -101,
            duration: 0.9,
            ease: "none",
          },
          "+=0.08",
        );
    }, el);

    return () => {
      ctx.revert();
      // SplitText markup is not owned by the context — put the DOM back
      splits.forEach((sp) => sp.revert());
    };
  }, []);

  return (
    <section
      ref={root}
      id="intro"
      className="relative overflow-hidden bg-scarlet text-white"
    >
      <div className="grid-page px-6 pt-16 pb-14 lg:px-15 lg:pt-24 lg:pb-20">
        <p
          className="intro-eyebrow label text-label-s col-span-6 lg:col-span-2"
        >
          {intro.eyebrow}
        </p>

        <div className="col-span-6 mt-10 lg:col-span-10 lg:col-start-3 lg:mt-0">
          <h2 className="intro-statement text-display-l max-w-[18ch] font-semibold">
            {intro.statement}
          </h2>

          <div className="relative mt-10 grid pt-5 lg:mt-14 lg:grid-cols-10">
            <span
              aria-hidden
              className="intro-rule absolute inset-x-0 top-0 h-px bg-white/35"
            />
            <p className="intro-note label text-label-s leading-relaxed lg:col-span-4 lg:col-start-7">
              {intro.note}
            </p>
          </div>
        </div>
      </div>

      {/* Bars assemble into a stair, then the connected shape slides upward. */}
      <div
        ref={band}
        aria-hidden
        className={`relative w-full overflow-hidden bg-gray-light-90 ${BAND_HEIGHT}`}
      >
        <div className="intro-stair-group absolute inset-0 flex flex-col">
          {STAIR_WIDTHS.map((width) => (
            <div key={width} className="-mb-px flex-1 last:mb-0">
              <div
                className="intro-stair invisible h-[calc(100%+1px)] bg-scarlet"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
