import { useEffect, useRef, useState } from "react";

/* =============================================================================
 * SANITY — the two lists members edit for themselves
 *   useTeam()    → the member grid, from `teamMember`
 *   useIssues()  → the newsletter list, from `newsletterIssue`
 * Both take the content.ts value as their starting state and swap in the CMS
 * copy when it lands, so the page renders instantly and an outage or an empty
 * dataset degrades to the hardcoded copy rather than a blank section.
 *
 * The dataset is public, so reads are unauthenticated — no token, and nothing
 * here is a secret. If it is ever made private this has to move into an api/
 * function; a Sanity token in a VITE_ var ships to every visitor.
 *
 * The schema lives in production-website/schemaTypes — same repo, separate
 * project. Renaming a field there breaks the query silently: the row comes
 * back with nulls and the section quietly falls back to content.ts.
 * ========================================================================== */
const PROJECT = "gkbg7i6n";
const DATASET = "production";
// apicdn is the cached edge — stale by up to a minute, which is the right
// trade for read-only marketing copy. Use `.api.` for uncached reads.
const API = `https://${PROJECT}.apicdn.sanity.io/v2024-01-01/data/query/${DATASET}`;

/** Sanity's image and file assets are served straight off their CDN. */
const sized = (url: string | null, w: number) =>
  url ? `${url}?w=${w}&auto=format` : null;

/**
 * Runs one GROQ query and maps the rows. Keeps `fallback` until the response
 * arrives, and ignores an empty result so an unpopulated type never blanks a
 * section that content.ts can still fill.
 */
function useSanity<Row, T>(
  query: string,
  map: (rows: Row[]) => T[],
  fallback: T[],
): T[] {
  const [data, setData] = useState(fallback);
  // `map` is a fresh closure every render, so it can never be a dependency
  // without refetching on each one. Read it through a ref instead: the query
  // string is the real identity of the request.
  const mapper = useRef(map);
  mapper.current = map;

  useEffect(() => {
    let live = true;
    fetch(`${API}?query=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(({ result }: { result?: Row[] }) => {
        if (!live || !result?.length) return;
        // this changes the section's height; the body ResizeObserver in
        // lib/anim.ts picks that up and refreshes ScrollTrigger's offsets
        setData(mapper.current(result));
      })
      // a failed fetch is not worth a broken page — the fallback is already on
      // screen, so log and leave it
      .catch((err) => console.warn("sanity:", err));
    return () => {
      live = false;
    };
  }, [query]);

  return data;
}

/* ---- team ---------------------------------------------------------------- */

export type Member = {
  name: string;
  role: string;
  photo: string;
  bio: string;
  /** CSS object-position, so a non-square portrait crops where the CMS says. */
  focus?: string;
};

type MemberRow = {
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
  hotspot: { x: number; y: number } | null;
};

const TEAM_QUERY = `*[_type == "teamMember" && defined(photo.asset)] | order(order asc) {
  name,
  role,
  bio,
  "photo": photo.asset->url,
  "hotspot": photo.hotspot
}`;

/**
 * The hotspot is where the member dragged the crop circle, as a 0–1 fraction of
 * the image. object-position wants percentages, and the two mean the same thing
 * under object-cover: the point that stays in frame.
 */
const focusFrom = (h: MemberRow["hotspot"]) =>
  h ? `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%` : undefined;

/** Exported for the self-check in sanity.test.mts — no live dataset needed. */
export const mapMembers = (rows: MemberRow[]): Member[] =>
  rows.map((r) => ({
    name: r.name,
    role: r.role ?? "",
    bio: (r.bio ?? "").trim(),
    photo: sized(r.photo, 600)!,
    focus: focusFrom(r.hotspot),
  }));

export function useTeam(fallback: Member[]): Member[] {
  return useSanity<MemberRow, Member>(TEAM_QUERY, mapMembers, fallback);
}

/* ---- newsletter issues --------------------------------------------------- */

/**
 * One issue, in the shape both the Work row and the /archive list want.
 * `published` false means it is a placeholder plate showing `due`.
 */
export type Issue = {
  volume: number;
  title: string;
  blurb: string;
  cover: string | null;
  html: string | null;
  pdf: string | null;
  date: string;
  published: boolean;
  due: string;
};

type IssueRow = {
  volume: number;
  title: string | null;
  blurb: string | null;
  publishedAt: string | null;
  dueMonth: string | null;
  cover: string | null;
  html: string | null;
  pdf: string | null;
};

// the issue files are uploads, so publishing an edition never needs a commit
const ISSUE_QUERY = `*[_type == "newsletterIssue"] | order(volume asc) {
  volume,
  title,
  blurb,
  publishedAt,
  dueMonth,
  "cover": cover.asset->url,
  "html": html.asset->url,
  "pdf": pdf.asset->url
}`;

/** "2026-07-19" → "Published : 07/19/2026", matching the hand-written rows. */
const stamp = (iso: string | null) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `Published : ${m}/${d}/${y}`;
};

/**
 * CMS rows win for copy and the cover. HTML and PDF prefer the matching
 * `content.ts` path when one exists: those files live next to `/fonts` and
 * `/img`, and the Sanity CDN copy of the HTML cannot see either. An issue
 * that exists only in the Studio still uses the uploaded file URLs.
 *
 * Exported for the self-check in sanity.test.mts — no live dataset needed.
 */
export const mapIssues = (rows: IssueRow[], locals: Issue[] = []): Issue[] =>
  rows.map((r) => {
    const local = locals.find((i) => i.volume === r.volume);
    const html = local?.html ?? r.html;
    // `?dl=` makes the CDN answer with Content-Disposition: attachment. The
    // <a download> attribute alone is ignored cross-origin, so without this
    // the PDF would open in a viewer instead of downloading. Same-origin
    // files in public/ do not need it.
    const pdf = local?.pdf ?? (r.pdf ? `${r.pdf}?dl=` : null);
    return {
      volume: r.volume,
      title: r.title ?? "",
      blurb: r.blurb ?? "",
      cover: sized(r.cover, 900),
      html,
      pdf,
      date: stamp(r.publishedAt),
      // an issue counts as out once it has both a date and something to read
      published: Boolean(r.publishedAt && html),
      due: r.dueMonth ?? "",
    };
  });

export function useIssues(fallback: Issue[]): Issue[] {
  return useSanity<IssueRow, Issue>(
    ISSUE_QUERY,
    (rows) => mapIssues(rows, fallback),
    fallback,
  );
}
