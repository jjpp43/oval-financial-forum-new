import { Fragment, useEffect, useRef, useState } from "react";
import { team } from "../content";
import { useCharReveal } from "../lib/anim";
import { useTeam, type Member } from "../lib/sanity";

/** Column count of the grid, mirroring the Tailwind breakpoints below. */
const readCols = (bare: boolean) =>
  window.innerWidth >= 1024
    ? bare
      ? 5
      : 3
    : bare || window.innerWidth >= 768
      ? 2
      : 1;

function useColumns(bare: boolean) {
  const [cols, setCols] = useState(() => readCols(bare));

  useEffect(() => {
    const onResize = () => setCols(readCols(bare));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bare]);

  return cols;
}

/** Left half of the row reads left, the middle column centres, right half right. */
function side(col: number, cols: number) {
  if (cols === 1) return "left" as const;
  const middle = (cols - 1) / 2;
  if (col < middle) return "left" as const;
  if (col > middle) return "right" as const;
  return "center" as const;
}

function align(col: number, cols: number) {
  const s = side(col, cols);
  return s === "center"
    ? "text-center"
    : s === "right"
      ? "text-right"
      : "text-left";
}

/** Indents the copy to the clicked card's column, plus that card's own 1rem. */
function edges(col: number, cols: number) {
  const s = side(col, cols);
  const track = (n: number) => `calc(${(n / cols) * 100}% + 1rem)`;
  if (s === "center") return { marginInline: "auto", paddingInline: "1rem" };
  if (s === "right")
    return { marginLeft: "auto", marginRight: track(cols - 1 - col) };
  return { marginLeft: track(col), marginRight: "1rem" };
}

/**
 * LinkedIn + mail icons. Live in the caption row with the name, so the hover
 * indent moves them together. Kept out of the overlay button — nested <a>
 * inside <button> is invalid.
 */
const LINKEDIN =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z";

function Links({ member, open }: { member: Member; open: boolean }) {
  if (!member.linkedin && !member.email) return null;
  const tone = open ? "text-white" : "text-scarlet";
  const hit =
    "grid size-8 place-items-center transition-opacity duration-200 hover:opacity-70";
  return (
    <div className={`flex shrink-0 items-center ${tone}`}>
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className={hit}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden
          >
            <path d={LINKEDIN} />
          </svg>
        </a>
      )}
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          aria-label={`Email ${member.name}`}
          className={hit}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden
          >
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
        </a>
      )}
    </div>
  );
}

/**
 * One member cell. `large` is the /team variant (full-width 3:4 portrait,
 * clickable, opens the bio strip); without it you get the home page's small
 * square thumb beside the name.
 */
function Card({
  member,
  large = false,
  open = false,
  onOpen,
}: {
  member: Member;
  large?: boolean;
  open?: boolean;
  onOpen?: () => void;
}) {
  const hasLinks = Boolean(large && (member.linkedin || member.email));
  // /team: extra padding on both sides, same 8px as the home row's pl-6.
  // A left-only indent (or a translate) slides the photo and leaves the
  // icons glued to the right; padding-inline tucks the whole stack in.
  const pad = large
    ? "relative flex flex-col gap-5 p-4 transition-[padding-inline] duration-200 group-hover:px-5"
    : "flex items-stretch gap-5 p-4 transition-[padding-left] duration-200 group-hover:pl-6";

  const photo = (
    <div
      className={`shrink-0 overflow-hidden ${
        large ? "aspect-3/4 w-full" : "aspect-square w-24 lg:w-28"
      }`}
    >
      <img
        src={member.photo}
        alt={member.name}
        className="h-full w-full object-cover"
        style={{ objectPosition: member.focus ?? "center" }}
      />
    </div>
  );

  const identity = (
    <div className={hasLinks && onOpen ? "pointer-events-none" : ""}>
      <h3
        className={`text-body-l font-medium leading-tight transition-colors duration-200 ${
          open ? "text-white" : "text-scarlet"
        } ${large ? "" : "group-hover:text-white"}`}
      >
        {member.name}
      </h3>
      <p
        className={`label text-label-s mt-2 transition-colors duration-200 ${
          open ? "text-white/80" : "text-gray-dark-40"
        } ${large ? "" : "group-hover:text-white/80"}`}
      >
        {member.role}
      </p>
    </div>
  );

  // On /team the scarlet fill is reserved for the open card, so it reads as
  // one block with the bio strip below it. flex, not block: a <button> centres
  // its content box vertically whatever its display, so a card with a short
  // name would float in the middle of a taller row.
  const shell = `team-card group flex flex-col w-full border-t border-scarlet/20 text-left transition-colors duration-200 ${
    large ? "cursor-pointer" : "hover:bg-scarlet"
  } ${open ? "bg-scarlet" : ""}`;

  // /team: name, title, and icons share one row inside the padded column, so
  // the hover indent moves them together. An overlay button opens the bio —
  // the icons sit above it, because an <a> inside a <button> is invalid.
  if (large) {
    return (
      <div className={shell}>
        <div className={pad}>
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              aria-expanded={open}
              aria-label={`${member.name}, ${member.role}`}
              className="absolute inset-0 z-[1]"
            />
          )}
          {photo}
          <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">{identity}</div>
            {hasLinks && <Links member={member} open={open} />}
          </div>
        </div>
      </div>
    );
  }

  const homeBody = (
    <div className={pad}>
      {photo}
      <div className="flex min-w-0 flex-col justify-center">{identity}</div>
    </div>
  );

  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      className={shell}
    >
      {homeBody}
    </button>
  ) : (
    <article className={shell}>{homeBody}</article>
  );
}

/**
 * Bio panel spanning the full row under the clicked card, so an open bio never
 * stretches its neighbours — one row of the grid growing, not a layer above it.
 */
function Strip({
  member,
  open,
  col,
  cols,
}: {
  member: Member | null;
  open: boolean;
  col: number;
  cols: number;
}) {
  // keep the last member while the panel collapses, so the copy does not
  // vanish a frame before the height does
  const last = useRef<{ member: Member; col: number; cols: number } | null>(
    null,
  );
  if (member) last.current = { member, col, cols };
  const shown = member ? { member, col, cols } : last.current;

  // 0fr → 1fr rather than a height tween: the card's fill is a CSS transition
  // too, so both run on the same curve and the same frame — one block growing
  return (
    <div
      className="team-bio col-span-full grid transition-[grid-template-rows] duration-400 ease-in-out"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div
        className={`overflow-hidden transition-opacity duration-400 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-scarlet py-12 text-white">
          {/* the copy lines up with the card that opened it: the 1rem offsets
              match the card's own p-4, so the first character sits on the same
              vertical as its name and role */}
          {shown && (
            <div
              className={`max-w-[56ch] ${align(shown.col, shown.cols)}`}
              style={edges(shown.col, shown.cols)}
            >
              {/* name and role stay on the card — the strip is bio only */}
              <p className="text-body-s font-medium leading-relaxed">
                {shown.member.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
 * HOME · section 6 of 6 — TEAM   ·   and the body of /team
 * The member grid. `bare` is the /team variant: it drops the headline (the
 * page has its own masthead), goes to 5 columns, and makes each card open a
 * bio strip under its row. Copy: `team.members` in content.ts.
 * ========================================================================== */
export default function Team({ bare = false }: { bare?: boolean }) {
  const headline = useCharReveal<HTMLHeadingElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cols = useColumns(bare);
  const members = useTeam(team.members);

  // one strip per row; the open card's row is the only one with a height
  const rows: Member[][] = [];
  for (let i = 0; i < members.length; i += cols)
    rows.push(members.slice(i, i + cols));

  const openInRow = (r: number) =>
    openIndex !== null && Math.floor(openIndex / cols) === r;

  return (
    <section id="team" className="px-6 py-28 lg:px-15 lg:py-40">
      <div className={`grid-page ${bare ? "hidden" : ""}`}>
        <h2
          ref={headline}
          className="text-display-l col-span-6 mt-8 font-semibold lg:col-span-12 lg:mt-12"
        >
          {team.headline}
        </h2>
      </div>

      <div
        className={`grid border-b border-scarlet/20 md:grid-cols-2 ${
          bare ? "grid-cols-2 lg:grid-cols-5" : "mt-16 lg:mt-24 lg:grid-cols-3"
        }`}
      >
        {rows.map((row, r) => (
          <Fragment key={r}>
            {row.map((m, c) => {
              const i = r * cols + c;
              return (
                <Card
                  key={m.name}
                  member={m}
                  large={bare}
                  open={openIndex === i}
                  onOpen={
                    bare && m.bio
                      ? () => setOpenIndex(openIndex === i ? null : i)
                      : undefined
                  }
                />
              );
            })}
            {bare && (
              <Strip
                member={openInRow(r) ? members[openIndex!] : null}
                open={openInRow(r)}
                col={openInRow(r) ? openIndex! % cols : 0}
                cols={cols}
              />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
