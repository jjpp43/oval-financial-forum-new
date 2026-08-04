import { useEffect, useRef } from "react";
import gsap from "gsap";
import Duotone from "../components/Duotone";
import NewsletterField from "../components/NewsletterField";
import { hero, studio } from "../content";
import { curtainGone, splitWords } from "../lib/anim";

/* =============================================================================
 * HOME · section 1 of 6 — HERO
 * The first full screen: dithered photo behind a scarlet wash, the two-line
 * "Oval / Financial Forum" wordmark, the tagline, and the subscribe field.
 * Copy: `hero` + `studio` in content.ts.
 * ========================================================================== */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = Array.from(
      el.querySelectorAll<HTMLElement>(".hero-title"),
    ).flatMap(splitWords);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline({ paused: true });
    // flip-board: each word swings down on its top edge, split-flap style.
    // fromTo, not from — StrictMode kills the first timeline with the words
    // parked at opacity 0, and a from() would then treat that as its endpoint
    tl.fromTo(
      words,
      { rotationX: -90, opacity: 0 },
      {
        rotationX: 0,
        opacity: 1,
        transformOrigin: "50% 0%",
        duration: 0.5,
        ease: "power2.out",
        stagger: { each: 0.14, from: "start" },
      },
    ).fromTo(
      el.querySelectorAll(".hero-meta"),
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
      "-=0.5",
    );

    // was a guessed 1.4s delay, which started the reveal behind the curtain
    let cancelled = false;
    curtainGone.then(() => {
      if (!cancelled) tl.play();
    });

    return () => {
      cancelled = true;
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex h-svh flex-col justify-center overflow-hidden px-6 pt-28 pb-16 text-white lg:px-15"
    >
      {/* ---- background: dithered plate + scarlet gradients ---------------- */}
      <div className="absolute inset-0 -z-10">
        <Duotone src="/img/p1.jpg" gamma={1.5} dither ditherWidth={460} />
        <div className="absolute inset-0 bg-gradient-to-t from-scarlet via-scarlet/65 to-scarlet/50" />
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-scarlet via-scarlet/70 to-transparent" />
      </div>

      <h1 className="sr-only">
        {studio.name} — {studio.tagline}
      </h1>

      {/* ---- wordmark: the flip-board lines ------------------------------- */}
      {/* One .hero-title per line — splitWords() rebuilds each element from
          its textContent, so a <br /> inside one would be discarded. */}
      {["The Oval", "Financial Forum"].map((line) => (
        <span
          key={line}
          aria-hidden
          className="hero-title block font-semibold leading-[0.9] tracking-[-0.01em] whitespace-nowrap"
          // perspective on the line, not the glyph — without it rotationX
          // flattens into a vertical squash with no depth
          style={{
            fontSize: "clamp(3.2rem, 8.2vw, 9rem)",
            perspective: "600px",
          }}
        >
          {line}
        </span>
      ))}

      {/* ---- bottom row: tagline left, subscribe field right --------------- */}
      <div className="grid-page mt-10 lg:mt-14">
        <p className="hero-meta text-body-l col-span-6 max-w-[42ch] lg:col-span-5">
          {studio.tagline}
        </p>

        {/* newsletter capture — the org's whole point is the monthly issue */}
        <NewsletterField
          id="hero-email"
          hint={hero.newsletterHint}
          inputFill="bg-scarlet/50"
          className="hero-meta col-span-6 mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0"
        />
      </div>
    </section>
  );
}
