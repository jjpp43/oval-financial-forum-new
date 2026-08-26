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
  html: "https://cdn.sanity.io/files/x/production/abc.html",
  pdf: "https://cdn.sanity.io/files/x/production/abc.pdf",
};

const [out] = mapIssues([issue]);
assert.equal(out.date, "Published : 07/19/2026");
assert.equal(out.published, true);
assert.equal(out.pdf, `${issue.pdf}?dl=`, "PDF needs ?dl= or it opens in a viewer");
assert.ok(out.cover?.endsWith("?w=900&auto=format"), "cover should be resized");

// a matching content.ts row keeps the issue on this origin, so /fonts and
// /img resolve. The CDN html url is what made localhost look broken.
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
assert.equal(local.html, "/newsletter/2026/june-2026.html");
assert.equal(local.pdf, "/newsletter/2026/june-2026.pdf");
assert.equal(local.title, "June Edition", "CMS copy still wins");

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
assert.ok(mapped.photo.endsWith("?w=600&auto=format"));
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
    photo: "/team/Evan_Tercek.jpeg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/evantercek/",
    email: "tercek.1@osu.edu",
  },
]);
assert.equal(withLinks.linkedin, "https://www.linkedin.com/in/evantercek/");
assert.equal(withLinks.email, "tercek.1@osu.edu");

console.log("sanity mapping ok");
