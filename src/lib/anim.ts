import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

/* =============================================================================
 * MOTION TOOLKIT — every reveal on the site comes from here.
 *   splitWords / splitChars / splitLines  rebuild an element for animation
 *   useWordReveal / useCharReveal / useLineReveal / useRise  scroll reveals
 *   curtainGone / liftCurtain             load-curtain handshake
 *   useLenis                              smooth scroll, wired to GSAP
 * Every hook early-returns under prefers-reduced-motion.
 * ========================================================================== */

let lift: () => void;
/**
 * Resolves when the load curtain is off the screen. Anything that animates
 * above the fold waits on this, or it plays out of sight behind the panels.
 * Later route changes see it already resolved and start immediately.
 */
export const curtainGone = new Promise<void>((resolve) => {
  lift = resolve;
});
export const liftCurtain = () => lift();

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits text into word-masks. Returns the inner spans to animate. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === "done") {
    return Array.from(el.querySelectorAll<HTMLElement>(".word > span"));
  }
  const words = (el.textContent ?? "").split(/\s+/).filter(Boolean);
  el.textContent = "";
  const inner: HTMLElement[] = [];
  words.forEach((w, i) => {
    const outer = document.createElement("span");
    outer.className = "word";
    const span = document.createElement("span");
    span.textContent = w;
    outer.appendChild(span);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    inner.push(span);
  });
  el.dataset.split = "done";
  return inner;
}

/**
 * Word-mask reveal on scroll. Attach the returned ref to any text element.
 * `delay` staggers whole blocks against each other.
 */
export function useWordReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = splitWords(el);
    if (reduced()) return;

    const tween = gsap.fromTo(
      spans,
      { yPercent: 125 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.045,
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return ref;
}

/**
 * Splits into per-character spans, keeping words unbreakable so the line
 * wraps normally. Donor uses this on every display heading.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === "chars") {
    return Array.from(el.querySelectorAll<HTMLElement>(".char"));
  }
  const words = (el.textContent ?? "").split(/(\s+)/);
  el.textContent = "";
  el.classList.add("split-text");
  const chars: HTMLElement[] = [];

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      el.appendChild(document.createTextNode(" "));
      continue;
    }
    const holder = document.createElement("span");
    holder.style.display = "inline-block";
    holder.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const span = document.createElement("span");
      span.className = "char";
      span.style.display = "inline-block";
      span.style.willChange = "transform";
      span.textContent = ch;
      holder.appendChild(span);
      chars.push(span);
    }
    el.appendChild(holder);
  }
  el.dataset.split = "chars";
  return chars;
}

/** Per-character reveal — translate + rotate, like the donor's headings. */
export function useCharReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = splitChars(el);
    if (reduced()) return;

    const tween = gsap.fromTo(
      chars,
      { yPercent: 100, rotate: 4, autoAlpha: 0 },
      {
        yPercent: 0,
        rotate: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.012,
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return ref;
}

/**
 * Rebuilds an element as one overflow-hidden mask per rendered line. Returns
 * the inner spans to animate.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  // stash the pristine copy on first run. Reading textContent back off the
  // built masks would concatenate block spans with no separator and glue
  // the words at each line break together.
  if (el.dataset.source === undefined) el.dataset.source = el.textContent ?? "";

  el.textContent = el.dataset.source;
  // textContent reset wipes the spans, so clear the marker too or
  // splitWords short-circuits and hands back an empty list (StrictMode
  // double-invokes callers and would blank the paragraph)
  delete el.dataset.split;
  const words = splitWords(el);
  // group word spans by their vertical offset = one rendered line
  const lines = new Map<number, HTMLElement[]>();
  for (const span of words) {
    const top = Math.round(span.getBoundingClientRect().top);
    if (!lines.has(top)) lines.set(top, []);
    lines.get(top)!.push(span);
  }
  el.textContent = "";
  el.classList.add("line-split");

  const inners: HTMLElement[] = [];
  for (const group of lines.values()) {
    const mask = document.createElement("span");
    mask.style.display = "block";
    mask.style.overflow = "hidden";
    const inner = document.createElement("span");
    inner.style.display = "block";
    inner.style.willChange = "transform";
    inner.textContent = group.map((s) => s.textContent).join(" ");
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  }
  return inners;
}

/**
 * Line-based mask reveal for body copy. Measures rendered line boxes after
 * layout, so it re-splits on resize.
 */
export function useLineReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const inners = splitLines(el);
    if (reduced()) return;

    const tween = gsap.fromTo(
      inners,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.08,
        delay,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return ref;
}

/** Simple fade+rise for non-text blocks. */
export function useRise<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const tween = gsap.fromTo(
      el,
      { y: 32, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power2.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return ref;
}

/**
 * Keeps trigger positions honest. ScrollTrigger measures start/end pixels once,
 * at creation — but this page keeps growing after that: webfonts reflow every
 * heading, the dither canvases size themselves, and the Sanity lists swap in
 * more cards. Without this the reveals fire against stale offsets and go off
 * early. Cheap to over-call; refresh is idempotent.
 */
function useScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    // catches everything the two events above miss — images decoding, the bio
    // strip opening, a route swapping the whole body. Height-gated: a refresh
    // can itself nudge layout, and calling straight back into it from the
    // observer is how you get a feedback loop.
    let last = document.body.offsetHeight;
    const observer = new ResizeObserver(() => {
      const height = document.body.offsetHeight;
      if (height === last) return;
      last = height;
      refresh();
    });
    observer.observe(document.body);

    return () => {
      window.removeEventListener("load", refresh);
      observer.disconnect();
    };
  }, []);
}

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useLenis() {
  useScrollRefresh();

  useEffect(() => {
    if (reduced()) return;
    // long coast after each wheel notch — `duration` is seconds to settle,
    // `wheelMultiplier` the distance one notch asks for. Use `lerp` instead of
    // `duration` if you ever want catch-up physics rather than a timed ease.
    const lenis = new Lenis({
      duration: 1.6,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
