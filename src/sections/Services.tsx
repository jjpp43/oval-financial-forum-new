import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Duotone from "../components/Duotone";
import { services } from "../content";
import { splitChars } from "../lib/anim";

/* The overlapping page stack beside the accordion. Positions are percentages
   of the collage box; the third plate sits over the other two. */
const PLATES = [
  { src: "/img/ex1.png", left: "0%", top: "0%", z: 1 },
  { src: "/img/ex2.png", left: "58%", top: "10%", z: 2 },
  { src: "/img/ex3.png", left: "23%", top: "44%", z: 3 },
];

/** One accordion line in the "We Present" list — hover or focus opens it. */
function Row({
  index,
  title,
  body,
  open,
  onOpen,
}: {
  index: number;
  title: string;
  body: string;
  open: boolean;
  onOpen: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.to(el, {
      height: open ? "auto" : 0,
      autoAlpha: open ? 1 : 0,
      duration: reduced ? 0 : 0.4,
      ease: "power2.out",
    });
  }, [open]);

  return (
    <li
      className="service-row group border-t border-scarlet/25"
      onMouseEnter={onOpen}
    >
      <h3>
        {/* still a button: hover opens it, but keyboard and touch need a
            real control — focus and click both open it too */}
        <button
          type="button"
          onFocus={onOpen}
          onClick={onOpen}
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-6 py-5 pr-1 text-left transition-[padding-left] duration-300 ${
            open ? "pl-3" : "pl-0 group-hover:pl-6"
          }`}
        >
          <span className="text-heading font-semibold">{title}</span>
          {/* one glyph that rotates — swapping + for × makes the mark jump,
              since the two have different widths and optical centres */}
          <span
            aria-hidden
            className={`text-heading shrink-0 leading-none opacity-60 transition-transform duration-300 ${
              open ? "rotate-45" : "rotate-0"
            }`}
          >
            +
          </span>
        </button>
      </h3>

      <div ref={panel} className="h-0 overflow-hidden opacity-0">
        <div
          className={`grid-page pb-8 transition-[padding-left] duration-300 ${
            open ? "pl-6" : "pl-0"
          }`}
        >
          <p className="label text-label-s col-span-6 max-w-[46ch] leading-relaxed text-gray-dark-40 lg:col-span-5 lg:col-start-2">
            {body}
          </p>
        </div>
      </div>
      <span className="sr-only">{index + 1}</span>
    </li>
  );
}

/* =============================================================================
 * HOME · section 3 of 6 — SERVICES / "We Present"
 * The two drifting words, the duotone plate, and the hover-expand accordion of
 * newsletter departments. Copy: `services` in content.ts.
 * ========================================================================== */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const left = el.querySelector<HTMLElement>(".word-left");
    const right = el.querySelector<HTMLElement>(".word-right");
    if (!left || !right) return;

    const chars = [...splitChars(left), ...splitChars(right)];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = gsap.fromTo(
      chars,
      { yPercent: 100, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.02,
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      },
    );

    // the two words drift apart as the section scrolls past
    const spread = gsap.fromTo(
      [left, right],
      { xPercent: (i) => (i === 0 ? -20 : 20) },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
        },
      },
    );

    // the stack deals itself in — each plate slides in from its own side,
    // one after the next in paint order
    const plates = gsap.fromTo(
      el.querySelectorAll(".plate"),
      {
        y: 140,
        xPercent: (i) => [-45, 45, 0][i] ?? 0,
        scale: 0.9,
        autoAlpha: 0,
      },
      {
        y: 0,
        xPercent: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      },
    );

    // then they drift at slightly different rates, so the overlaps breathe as
    // the section passes — yPercent, so it composes with the entry's y
    const drift = gsap.fromTo(
      el.querySelectorAll(".plate"),
      { yPercent: (i) => [14, -14, 7][i] ?? 0 },
      {
        yPercent: (i) => [-14, 14, -7][i] ?? 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
        },
      },
    );

    return () => {
      reveal.scrollTrigger?.kill();
      reveal.kill();
      spread.scrollTrigger?.kill();
      spread.kill();
      plates.scrollTrigger?.kill();
      plates.kill();
      drift.scrollTrigger?.kill();
      drift.kill();
    };
  }, []);

  return (
    <section
      ref={root}
      id="services"
      className="overflow-hidden px-6 pt-32 pb-32 lg:px-15 lg:pt-50 lg:pb-40"
    >
      {/* heading centred in the viewport, the two words meeting at the middle */}
      <div className="flex items-baseline justify-center gap-[2vw]">
        <span className="word-left text-display-l block font-semibold">We</span>
        <span className="word-right text-display-l block font-semibold">
          Present
        </span>
      </div>

      {/* ---- left: plate + caption · right: accordion, then the CTA ------- */}
      <div className="grid-page mt-20 lg:mt-32">
        <div className="col-span-6 lg:col-span-5">
          {/* three pages overlapping in a loose stack — percentages of one
              box, so the whole collage scales with the column */}
          <div className="relative aspect-[1022/960] w-full">
            {PLATES.map((p) => (
              <div
                key={p.src}
                className="plate absolute h-[56%] w-[42%] overflow-hidden"
                style={{ left: p.left, top: p.top, zIndex: p.z }}
              >
                <Duotone
                  src={p.src}
                  gamma={1.5}
                  white={0.9}
                  dither
                  // plates draw at ~230px: dithering at 240 puts one dot on
                  // one pixel. At 600 the browser downscales 1-bit art, and
                  // that interference is what reads as harsh.
                  ditherWidth={880}
                />
              </div>
            ))}
          </div>
        </div>

        <ul className="col-span-6 mt-12 border-b border-scarlet/25 lg:col-span-6 lg:col-start-7 lg:mt-0">
          {services.items.map((s, i) => (
            <Row
              key={s.title}
              index={i}
              title={s.title}
              body={s.body}
              open={open === i}
              onOpen={() => setOpen(i)}
            />
          ))}
        </ul>

        <a
          href="#work"
          className="label text-label-s col-span-6 mt-10 block bg-scarlet py-4 text-center text-white transition-opacity duration-200 hover:opacity-90 lg:col-span-6 lg:col-start-7"
        >
          View all services
        </a>
      </div>
    </section>
  );
}
