import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homeSections } from "../content";

gsap.registerPlugin(ScrollTrigger);

/* =============================================================================
 * HOME — desktop publication spine
 * Continuous page progress on the right rail, with one tick per home section.
 * Hidden below xl so it lives entirely inside the generous desktop gutter.
 * ========================================================================== */
export default function ScrollSpine() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1280px)", () => {
      const rail = track.current;
      const progress = fill.current;
      const cursor = marker.current;
      if (!rail || !progress || !cursor) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const activate = (index: number) => {
        setActive(index);
        setOnDark(homeSections[index].inverse);
      };

      const timeline = gsap.timeline({
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: reduced ? true : 0.25,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .fromTo(
          progress,
          { scaleY: 0 },
          { scaleY: 1, transformOrigin: "50% 0%", ease: "none" },
          0,
        )
        .fromTo(
          cursor,
          { y: 0 },
          { y: () => rail.offsetHeight, ease: "none" },
          0,
        );

      const sectionTriggers = homeSections.flatMap((section, index) => {
        const element = document.getElementById(section.id);
        if (!element) return [];
        return [
          ScrollTrigger.create({
            trigger: element,
            start: "top center",
            end: "bottom center",
            onEnter: () => activate(index),
            onEnterBack: () => activate(index),
          }),
        ];
      });

      const footer = document.querySelector("footer");
      const footerTrigger = footer
        ? ScrollTrigger.create({
            trigger: footer,
            start: "top center",
            onEnter: () => setOnDark(true),
            onLeaveBack: () =>
              setOnDark(homeSections[homeSections.length - 1].inverse),
          })
        : null;

      return () => {
        sectionTriggers.forEach((trigger) => trigger.kill());
        footerTrigger?.kill();
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const node = label.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const tween = gsap.fromTo(
      node,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, [active]);

  return (
    <aside
      ref={root}
      aria-hidden
      className={`pointer-events-none fixed top-24 right-1 bottom-8 z-40 hidden w-8 transition-colors duration-200 xl:block ${
        onDark ? "text-white" : "text-scarlet"
      }`}
    >
      <div ref={track} className="absolute top-0 right-2 bottom-0 w-px">
        <span className="absolute inset-0 bg-current opacity-25" />
        <span
          ref={fill}
          className="absolute inset-0 origin-top scale-y-0 bg-current"
        />

        {homeSections.map((section, index) => (
          <span
            key={section.id}
            className="absolute right-[-3px] h-px w-[7px] -translate-y-1/2 bg-current"
            style={{ top: `${(index / (homeSections.length - 1)) * 100}%` }}
          />
        ))}
      </div>

      <div
        ref={marker}
        className="absolute top-0 right-0 grid h-4 w-4 -translate-y-1/2 place-items-center"
      >
        <span className="h-2 w-2 bg-current" />
      </div>

      <span
        ref={label}
        className={`label text-label-s absolute right-7 bottom-0 whitespace-nowrap ${
          homeSections[active].id === "intro" ? "text-scarlet" : ""
        }`}
        style={{ writingMode: "vertical-rl", rotate: "180deg" }}
      >
        {String(active + 1).padStart(2)} /{" "}
        {String(homeSections.length).padStart(2)} — {homeSections[active].label}
      </span>
    </aside>
  );
}
