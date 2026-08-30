/**
 * Self-check for the CMS row mapping — the part that has branches and gets no
 * coverage from a render, because the dataset is still empty.
 * Run: node src/lib/sanity.test.mts
 */
import assert from "node:assert/strict";
import { mapIssues, mapMembers } from "./sanity.ts";

/* ---- issues -------------------------------------------------------------- */

const issue = {
  volume: 1,
  title: "June Edition",
  blurb: "Blurb.",
  publishedAt: "2026-07-19",
  dueMonth: null,
  cover: "https://cdn.sanity.io/images/x/production/abc-500x500.jpg",
  html: "https://cdn.sanity.io/files/gkbg7i6n/production/abc.html",
  pdf: "https://cdn.sanity.io/files/gkbg7i6n/production/abc.pdf",
};

const [out] = mapIssues([issue]);
assert.equal(out.date, "Published : 07/19/2026");
assert.equal(out.published, true);
assert.equal(out.pdf, `${issue.pdf}?dl=`, "PDF needs ?dl= or it opens in a viewer");
assert.equal(
  out.html,
  `/api/issue?src=${encodeURIComponent(issue.html)}&pdf=${encodeURIComponent(issue.pdf)}`,
  "CDN HTML is opened through this origin so /fonts resolve",
);
assert.ok(out.cover?.endsWith("?w=900&auto=format"), "cover should be resized");

// content.ts is only the fallback — a matching local row must not hide a
// Studio upload, or members could not replace an edition without a commit
const [local] = mapIssues([issue], [
  {
    volume: 1,
    title: "ignored",
    blurb: "",
    cover: null,
    html: "/newsletter/2026/june-2026.html",
    pdf: "/newsletter/2026/june-2026.pdf",
    date: "",
    published: true,
    due: "",
  },
]);
assert.equal(
  local.html,
  `/api/issue?src=${encodeURIComponent(issue.html)}&pdf=${encodeURIComponent(issue.pdf)}`,
);
assert.equal(local.pdf, `${issue.pdf}?dl=`);
assert.equal(local.title, "June Edition", "CMS copy still wins");

// nothing uploaded yet — the local files keep the section from going blank
assert.equal(
  mapIssues([{ ...issue, html: null, pdf: null }], [
    {
      volume: 1,
      title: "",
      blurb: "",
      cover: null,
      html: "/newsletter/2026/june-2026.html",
      pdf: "/newsletter/2026/june-2026.pdf",
      date: "",
      published: true,
      due: "",
    },
  ])[0].html,
  "/newsletter/2026/june-2026.html",
);

// a date but nothing uploaded is not readable, so it stays a placeholder
// rather than rendering a card that links nowhere
assert.equal(mapIssues([{ ...issue, html: null }])[0].published, false);

// the unreleased plate: no date, no files, just the month it is due
const [soon] = mapIssues([
  {
    ...issue,
    title: null,
    blurb: null,
    publishedAt: null,
    dueMonth: "July 2026",
    cover: null,
    html: null,
    pdf: null,
  },
]);
assert.equal(soon.published, false);
assert.equal(soon.due, "July 2026");
assert.equal(soon.date, "");
assert.equal(soon.title, "");
assert.equal(soon.cover, null);
assert.equal(soon.pdf, null);

/* ---- team ---------------------------------------------------------------- */

const member = {
  name: "Evan Tercek",
  role: "President",
  bio: "  Studies accounting.  ",
  photo: "https://cdn.sanity.io/images/x/production/abc-1306x2048.jpg",
  hotspot: { x: 0.5, y: 0.18 },
};

const [mapped] = mapMembers([member]);
assert.equal(mapped.bio, "Studies accounting.");
assert.ok(mapped.photo.endsWith("?w=1080&auto=format"));
// the Studio's crop circle becomes the CSS object-position, so a tall portrait
// keeps the face in frame without a hand-tuned value in the site's code
assert.equal(mapped.focus, "50.0% 18.0%");

// no hotspot set — fall through to the CSS default rather than emitting "NaN%"
assert.equal(mapMembers([{ ...member, hotspot: null }])[0].focus, undefined);
assert.equal(mapMembers([{ ...member, role: null, bio: null }])[0].role, "");

const [withLinks] = mapMembers([member], [
  {
    name: "Evan Tercek",
    role: "President",
    photo: "/team/Evan_Tercek.jpg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/evantercek/",
    email: "tercek.1@osu.edu",
  },
]);
assert.equal(withLinks.linkedin, "https://www.linkedin.com/in/evantercek/");
assert.equal(withLinks.email, "tercek.1@osu.edu");

console.log("sanity mapping ok");
