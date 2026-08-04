import { useEffect, useRef } from "react";
import gsap from "gsap";
import Duotone from "./Duotone";
import { curtainGone, splitChars, splitLines } from "../lib/anim";

/**
 * Scarlet masthead every sub-page opens with. Sits under the fixed nav, so
 * the top padding clears it.
 *
 * Load sequence: the panel drops in as a solid block, its text wipes up line
 * by line once it lands, then everything below the banner rises. None of it
 * is scroll-driven — the whole page above the fold settles in one pass.
 */
export default function PageHead({
  eyebrow,
  headline,
  intro,
  bg,
}: {
  eyebrow: string;
  headline: string;
  intro: string;
  /** optional banner photo; shown as-is under a scarlet wash */
  bg?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    const block = copy.current;
    const h1 = title.current;
    if (!el || !block || !h1) return;

    // headline types out character by character; the rest wipes by line
    const chars = splitChars(h1);
    const lines = Array.from(block.children)
      .filter((child) => child !== h1)
      .flatMap((child) => splitLines(child as HTMLElement));
    // siblings are the page's own sections — hidden until the banner is done
    const below = Array.from(el.parentElement?.children ?? []).filter(
      (n) => n !== el,
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // hide the words now, not on play — a route change has no curtain to
    // cover the gap between mount and the timeline starting
    gsap.set(chars, { autoAlpha: 0 });

    // paused, but the fromTo start values render now — the panel is parked
    // above the fold and the copy is hidden before the curtain lifts
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      el,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.6, ease: "expo.out" },
    )
      // typewriter: each letter simply appears, no cursor. autoAlpha toggles
      // visibility, so the line holds its final width and nothing reflows.
      .to(
        chars,
        {
          autoAlpha: 1,
          duration: 0,
          ease: "none",
          stagger: 0.04,
        },
        "+=0.15",
      )
      .fromTo(
        lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.08 },
      )
      .fromTo(
        below,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" },
        "-=0.3",
      );

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
    <header ref={root} className="relative isolate bg-scarlet text-white">
      {bg && (
        <div className="absolute inset-0 -z-10">
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
          />
          {/* same dithered plate as the hero, held at low opacity — texture
              over the photo instead of replacing it */}
          <div className="absolute inset-0 opacity-50">
            <Duotone src={bg} gamma={2.2} dither ditherWidth={360} />
          </div>

          {/* scarlet wash keeps the photo legible while white type holds AA */}
          <div className="absolute inset-0 bg-scarlet/65 mix-blend-multiply" />
          <div className="absolute inset-0 bg-scarlet/25" />
        </div>
      )}

      <div
        ref={copy}
        className="grid-page px-6 pt-36 pb-20 lg:px-15 lg:pt-48 lg:pb-28"
      >
        <p className="label text-label-s col-span-6 opacity-70 lg:col-span-12">
          {eyebrow}
        </p>

        <h1
          ref={title}
          className="text-display-l col-span-6 mt-6 font-semibold lg:col-span-7 lg:mt-8"
        >
          {headline}
        </h1>

        <p className="text-body-l col-span-6 mt-8 max-w-[46ch] lg:col-span-4 lg:col-start-9 lg:mt-8">
          {intro}
        </p>
      </div>
    </header>
  );
}
