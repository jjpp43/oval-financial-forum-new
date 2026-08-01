import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * A route swap replaces the whole page under a scroll position that still
 * belongs to the old one. Jump to the top, then refresh ScrollTrigger — its
 * start/end offsets were measured against a document that no longer exists.
 */
export default function ScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
