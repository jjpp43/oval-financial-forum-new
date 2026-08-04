import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { curtainGone } from "./anim";

/* =============================================================================
 * POSTHOG — pageviews, autocapture, and the handful of events worth naming.
 *
 * The library is imported dynamically after the Stairs curtain lifts, so it
 * stays out of the initial chunk. That costs nothing here: the curtain covers
 * the viewport for the first ~2.2s, so there is no click to miss.
 *
 * Nothing happens without VITE_POSTHOG_KEY — `npm run dev` and any preview
 * build stay silent rather than polluting the project with local traffic.
 * A PostHog project key is public by design; it identifies the project, it
 * does not authorise anything, so it belongs in the client bundle.
 * ========================================================================== */
const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHog = Awaited<typeof import("posthog-js")>["default"];

let posthog: PostHog | null = null;
/** Events fired before the library lands, replayed in order once it does. */
let pending: Array<[string, Record<string, unknown>?]> = [];
let started = false;

/**
 * Loads and initialises PostHog once. Safe to call repeatedly — StrictMode
 * double-invokes the effect that calls it.
 */
async function start() {
  if (started || !KEY) return;
  started = true;

  await curtainGone;
  const { default: ph } = await import("posthog-js");
  ph.init(KEY, {
    api_host: HOST,
    // pageviews are sent by hand below: this is a single-page app, so the
    // library's automatic one would only ever fire for the first route
    capture_pageview: false,
    // sends a $pageleave on unload, which is what makes session duration and
    // bounce rate mean anything
    capture_pageleave: true,
  });

  posthog = ph;
  for (const [event, props] of pending) ph.capture(event, props);
  pending = [];
}

/**
 * Records one event. Callers never await and never check whether analytics is
 * up — before init the event queues, and with no key it is dropped.
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  if (posthog) posthog.capture(event, props);
  else pending.push([event, props]);
}

/**
 * Starts PostHog and sends a `$pageview` for every route. Mount once, inside
 * the router — `useLocation` needs that context.
 */
export function useAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    void start();
  }, []);

  useEffect(() => {
    track("$pageview", { $current_url: window.location.href, pathname });
  }, [pathname]);
}
