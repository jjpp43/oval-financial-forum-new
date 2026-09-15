import { useEffect, useRef, useState } from "react";
import { useLocation, type Location } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { armCurtain, curtainGone, liftCurtain } from "../lib/anim";
import { coverStairs, revealStairs } from "./stairsGate";

/**
 * Holds the rendered route one beat behind the URL so the stairs can cover
 * the outgoing page, swap, then lift. ScrollTrigger refresh and the jump to
 * top happen under the panels, not on the visible outgoing page.
 *
 * `shown` is a ref for the comparison so `setShown` does not retrigger this
 * effect and abort the reveal.
 */
export function useShownLocation(): Location {
  const location = useLocation();
  const [shown, setShown] = useState(location);
  const shownRef = useRef(location);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    curtainGone.then(() => setBooted(true));
  }, []);

  useEffect(() => {
    if (!booted) return;
    if (
      location.pathname === shownRef.current.pathname &&
      location.search === shownRef.current.search
    )
      return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let dead = false;
    const next = location;

    void (async () => {
      if (reduced) {
        shownRef.current = next;
        setShown(next);
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
        return;
      }

      armCurtain();
      await coverStairs();
      if (dead) return;
      shownRef.current = next;
      setShown(next);
      window.scrollTo(0, 0);
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );
      if (dead) return;
      ScrollTrigger.refresh();
      await revealStairs();
      if (dead) return;
      liftCurtain();
    })();

    return () => {
      dead = true;
    };
  }, [booted, location]);

  return shown;
}
