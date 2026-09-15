import { useEffect, useRef } from "react";
import gsap from "gsap";
import { liftCurtain } from "../lib/anim";
import { setStairsGate } from "./stairsGate";

const PANELS = 6;

/**
 * Intro curtain, then a shorter reprise on each in-app route.
 * Panels stay mounted after load (parked above the viewport) so the route
 * swap can drop them without remounting. The wordmark is load-only.
 */
export default function Stairs() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const panels = el.querySelectorAll<HTMLElement>(".stair");

    const covered = () =>
      Math.abs(Number(gsap.getProperty(panels[0], "yPercent"))) < 1;

    const cover = () => {
      el.style.pointerEvents = "auto";
      if (covered()) return Promise.resolve();
      return new Promise<void>((resolve) => {
        gsap.to(panels, {
          yPercent: 0,
          duration: 0.32,
          ease: "power3.inOut",
          stagger: 0.035,
          overwrite: true,
          onComplete: () => resolve(),
          onInterrupt: () => resolve(),
        });
      });
    };

    const reveal = () =>
      new Promise<void>((resolve) => {
        gsap.to(panels, {
          yPercent: -100,
          duration: 0.4,
          ease: "power3.inOut",
          stagger: 0.035,
          overwrite: true,
          onComplete: () => {
            el.style.pointerEvents = "none";
            resolve();
          },
          onInterrupt: () => resolve(),
        });
      });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      gsap.set(panels, { yPercent: -100 });
      liftCurtain();
      setStairsGate({
        cover: () => Promise.resolve(),
        reveal: () => Promise.resolve(),
      });
      return () => {
        setStairsGate(null);
      };
    }

    const tl = gsap.timeline({
      onComplete: () => {
        liftCurtain();
        setStairsGate({ cover, reveal });
      },
    });

    tl.to(el.querySelector(".stairs-mark"), {
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    })
      .to(
        el.querySelector(".stairs-mark"),
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
      setStairsGate(null);
    };
  }, []);

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
        <span
          className="label text-heading px-6 text-center text-white"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          The Oval Financial Forum
        </span>
      </div>
    </div>
  );
}
