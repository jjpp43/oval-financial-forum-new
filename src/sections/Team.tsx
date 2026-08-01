import { Fragment, useEffect, useRef, useState } from "react";
import Duotone from "../components/Duotone";
import { team } from "../content";
import { useCharReveal } from "../lib/anim";

type Member = (typeof team.members)[number];

/** Column count of the /team grid, mirroring the Tailwind breakpoints below. */
function useColumns() {
  const read = () =>
    window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 2 : 1;
  const [cols, setCols] = useState(read);

  useEffect(() => {
    const onResize = () => setCols(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
 * One member cell. `large` is the /team variant (full-width 3:4 portrait,
 * clickable, opens the bio strip); without it you get the home page's small
 * duotone thumb beside the name.
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
  const body = (
    <div
      className={`flex p-4 transition-[padding-left] duration-500 group-hover:pl-6 ${
        large ? "flex-col gap-5" : "items-stretch gap-5"
      }`}
    >
      {/* home grid puts a 1:1 thumb beside the name; /team stacks a full
          width 3:4 plate above it */}
      <div
        className={`shrink-0 overflow-hidden ${
          large ? "aspect-3/4 w-full" : "aspect-square w-24 lg:w-28"
        }`}
      >
        {/* /team shows the portraits straight; the home thumbs stay duotone */}
        {large ? (
          <img
            src={member.photo}
            alt={member.name}
            className="h-full w-full object-cover"
            style={{
              objectPosition: "focus" in member ? member.focus : "center",
            }}
          />
        ) : (
          <Duotone
            src={member.photo}
            gamma={1.1}
            style={{
              objectPosition: "focus" in member ? member.focus : "center",
            }}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
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
    </div>
  );

  // on /team the scarlet fill is reserved for the open card, so it reads as
  // one block with the bio strip below it
  const shell = `team-card group w-full border-t border-scarlet/20 text-left transition-colors duration-400 ease-in-out ${
    large ? "cursor-pointer" : "hover:bg-scarlet"
  } ${open ? "bg-scarlet" : ""}`;

  // only the full team page opens a bio, so only it becomes a control
  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      className={shell}
    >
      {body}
    </button>
  ) : (
    <article className={shell}>{body}</article>
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
  const cols = useColumns();

  // one strip per row; the open card's row is the only one with a height
  const rows: Member[][] = [];
  for (let i = 0; i < team.members.length; i += cols)
    rows.push(team.members.slice(i, i + cols));

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
          bare ? "lg:grid-cols-5" : "mt-16 lg:mt-24 lg:grid-cols-3"
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
                member={openInRow(r) ? team.members[openIndex!] : null}
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
