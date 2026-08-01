import { Link } from "react-router-dom";
import { nav, studio } from "../content";

/** Crosshair mark — also used at footer scale. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
      />
      <path d="M50 2v96M2 50h96" stroke="currentColor" strokeWidth="11" />
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
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white bg-scarlet px-6 py-4 text-white lg:px-15">
      <Link to="/" className={`${LINK} flex items-center gap-3`}>
        <Mark className="h-3.5 w-3.5" />
        <span className="label text-label-s">{studio.name}</span>
      </Link>

      {/* centred section links */}
      <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-10 md:flex">
        {nav.map((n) => (
          <Link key={n.href} to={n.href} className={LINK}>
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-stretch gap-1">
        <Link
          to="/apply"
          className="label text-label-s bg-white px-5 py-2 text-scarlet transition-opacity duration-200 hover:opacity-80"
        >
          Apply
        </Link>
      </div>
    </header>
  );
}
