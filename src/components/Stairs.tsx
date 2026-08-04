import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { liftCurtain } from "../lib/anim";

const PANELS = 6;

/**
 * Intro curtain. Panels cover the viewport, then lift in a staggered
 * staircase to reveal the page — the donor site's transition idiom,
 * rebuilt as a load-in rather than a route change.
 */
export default function Stairs() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setGone(true);
      liftCurtain();
      return;
    }

    const panels = root.current!.querySelectorAll(".stair");
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true);
        liftCurtain();
      },
    });

    tl.to(root.current!.querySelector(".stairs-mark"), {
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    })
      .to(
        root.current!.querySelector(".stairs-mark"),
        { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
        "+=0.35",
      )
      .to(panels, {
        yPercent: -100,
        duration: 0.85,
        ease: "power3.inOut",
        stagger: 0.07,
      });

    return () => {
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-100 flex pointer-events-none"
    >
      {Array.from({ length: PANELS }).map((_, i) => (
        <div key={i} className="stair h-full flex-1 bg-scarlet" />
      ))}
      <div className="stairs-mark absolute inset-0 grid place-items-center opacity-0">
        <span className="label text-label-lg text-white">
          The Oval Financial Forum
        </span>
      </div>
    </div>
  );
}
