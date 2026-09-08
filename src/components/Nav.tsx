import { useState } from "react";
import { Link } from "react-router-dom";
import { nav, studio } from "../content";
import { track } from "../lib/analytics";

/** OFF mark — inlined from public/img/LOGO.svg so it can take currentColor. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M300 0C377.573 0 448.269 29.4428 501.523 77.7627L447.352 131.934L167.278 499.952C192.42 547.556 242.42 580 300 580C382.843 580 450 512.843 450 430V171.713L522.711 99.001C570.749 152.195 600 222.681 600 300C600 465.685 465.685 600 300 600C222.681 600 152.195 570.749 99.001 522.711L154.484 467.227L433.208 100.981C408.23 52.8691 357.955 20 300 20C217.157 20 150 87.1573 150 170V429.287L77.7627 501.523C29.4428 448.269 0 377.573 0 300C0 134.315 134.315 0 300 0Z"
      />
    </svg>
  );
}

/* Solid scarlet bar, so nothing underneath competes with it. The white rule
   at the bottom is the only edge it needs. */
const LINK =
  "label text-label-s text-white transition-opacity duration-200 hover:opacity-70";

/* =============================================================================
 * NAV — fixed scarlet bar, on every route
 * Wordmark left, route links centred (from `nav` in content.ts), Apply button
 * right. Sub-page mastheads clear it with their own top padding.
 * ========================================================================== */
export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white bg-scarlet px-6 py-4 text-white lg:px-15">
      {/* not LINK — the shared hover fade would wash out the circle fill */}
      <Link
        to="/"
        className="label text-label-s group flex items-center gap-3 text-white"
      >
        {/* white circle grows out of the centre and the mark inverts into it —
            same centre-out fill the section links use */}
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 scale-0 rounded-full bg-white transition-[scale] duration-200 group-hover:scale-100"
          />
          <Mark className="relative h-4 w-4 transition-[color,rotate] duration-200 group-hover:rotate-180 group-hover:text-scarlet" />
        </span>
        <span className="label text-label-s">{studio.name}</span>
      </Link>

      {/* centred section links. Each is full bar height so its hover fill can
          open from the middle to both edges of the bar. */}
      <nav className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 gap-6 md:flex">
        {nav.map((n) => (
          <Link
            key={n.href}
            to={n.href}
            className="label text-label-s group relative flex items-center overflow-hidden px-4 text-white transition-colors duration-200 hover:text-scarlet"
          >
            <span
              aria-hidden
              className="absolute inset-0 scale-y-0 bg-white transition-transform duration-200 group-hover:scale-y-100"
            />
            <span className="relative">{n.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* white grows past the chip to both edges of the bar — the header's
            py-4 is exactly the distance it has to cover */}
        {/* below md it lives at the foot of the drawer instead */}
        <Link
          to="/apply"
          onClick={() => track("apply_clicked", { where: "bar" })}
          className="label text-label-s group relative hidden bg-white px-5 py-2 text-scarlet md:block"
        >
          <span
            aria-hidden
            className="absolute -top-4 -bottom-4 left-0 right-0 scale-y-0 bg-white transition-transform duration-200 group-hover:scale-y-100"
          />
          {/* the arrow has no width until hover, so the button grows into it */}
          <span className="relative flex items-center">
            Apply
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="ml-0 h-3 w-0 shrink-0 opacity-0 transition-[width,margin,opacity] duration-200 group-hover:ml-2 group-hover:w-3 group-hover:opacity-100"
            >
              <path d="M1 6h9M6.5 2.5 10 6l-3.5 3.5" />
            </svg>
          </span>
        </Link>

        {/* the centred links have nowhere to sit below md, so they move in here */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-6 w-6 flex-col justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-full bg-white transition-transform duration-200 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-full bg-white transition-transform duration-200 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* drops under the bar; 0fr → 1fr so it opens on the same curve as the
          rest of the page instead of a guessed height */}
      <div
        className="absolute inset-x-0 top-full grid border-b border-white bg-scarlet transition-[grid-template-rows] duration-400 md:hidden"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <nav className="flex flex-col overflow-hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              to={n.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? undefined : -1}
              className={`${LINK} border-t border-white/20 px-6 py-4 first:border-t-0`}
            >
              {n.label}
            </Link>
          ))}

          {/* the Apply chip, moved in — inverted so it still reads as the
              one action among the routes */}
          <Link
            to="/apply"
            onClick={() => {
              setOpen(false);
              track("apply_clicked", { where: "drawer" });
            }}
            tabIndex={open ? undefined : -1}
            className="label text-label-s border-t border-white/20 bg-white px-6 py-4 text-scarlet"
          >
            Apply
          </Link>
        </nav>
      </div>
    </header>
  );
}
