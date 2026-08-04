/**
 * One-shot import of the team into Sanity, seeded from what the site already
 * ships: the members in src/content.ts and their portraits in public/team/.
 *
 *   node --env-file=.env.local scripts/migrate-team.mts
 *
 * Needs SANITY_EDIT_API_KEY in .env.local — Manage → API → Tokens on project
 * gkbg7i6n, with Editor permission. That token can write: keep it out of git
 * and out of anything prefixed VITE_, which ships to the browser.
 *
 * Safe to re-run. It skips anyone already in the dataset, matching on name, so
 * a half-finished run resumes instead of duplicating people.
 *
 * (An earlier version read from the previous site's project, mndx0824. That
 * dataset stopped answering — private or deleted — and the repo is the better
 * source regardless: it is ours, and it is what the site falls back to.)
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { team } from "../src/content.ts";

const PROJECT = "gkbg7i6n";
const DATASET = "production";
const API = "v2024-01-01";

const token = process.env.SANITY_EDIT_API_KEY;
assert(token, "SANITY_EDIT_API_KEY missing — see the header of this file");
const auth = { Authorization: `Bearer ${token}` };

const query = async (groq: string) => {
  const url = `https://${PROJECT}.api.sanity.io/${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, { headers: auth });
  if (!res.ok) throw new Error(`query ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
};

/**
 * content.ts carries a CSS object-position for the two portraits that are not
 * square. Sanity wants the same point as a 0–1 hotspot, so "center 18%"
 * becomes { x: 0.5, y: 0.18 } and the member can drag it afterwards.
 */
function hotspotFrom(focus: string | undefined) {
  if (!focus) return undefined;
  const axis = (word: string) =>
    word === "center" ? 0.5 : word === "top" || word === "left" ? 0 : word === "bottom" || word === "right" ? 1 : Number.parseFloat(word) / 100;
  const [x, y] = focus.trim().split(/\s+/);
  const point = { x: axis(x), y: axis(y ?? "center") };
  assert(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `could not read focus "${focus}"`,
  );
  return point;
}

const existing: string[] = await query(`*[_type == "teamMember"].name`);
if (existing.length) console.log(`already in ${PROJECT}: ${existing.join(", ")}`);

/** Uploads the portrait and returns the asset id to reference. */
async function uploadPhoto(path: string, name: string) {
  // content.ts paths are web-absolute, so they resolve under public/
  const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/assets/images/${DATASET}?filename=${encodeURIComponent(path.split("/").pop()!)}`,
    { method: "POST", headers: { ...auth, "Content-Type": "image/jpeg" }, body: bytes },
  );
  if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
  return (await res.json()).document._id as string;
}

// content.ts lists them in display order; tens leave room to slot someone in
// between two people later without renumbering everyone
let order = 10;

for (const member of team.members) {
  const position = order;
  order += 10;

  if (existing.includes(member.name)) {
    console.log(`skip  ${member.name} — already there`);
    continue;
  }

  const assetId = await uploadPhoto(member.photo, member.name);
  const hotspot = hotspotFrom("focus" in member ? member.focus : undefined);

  const doc = {
    _type: "teamMember",
    name: member.name,
    role: member.role,
    // the site's copy separates sentences with two spaces; the CMS should hold
    // one clean run of prose
    bio: member.bio.replace(/\s+/g, " ").trim(),
    order: position,
    photo: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      // Sanity expects a crop alongside a hotspot; a zero crop means "nothing
      // trimmed", leaving the hotspot to do the work
      ...(hotspot && {
        hotspot: { _type: "sanity.imageHotspot", ...hotspot, height: 1, width: 1 },
        crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
      }),
    },
  };

  const res = await fetch(`https://${PROJECT}.api.sanity.io/${API}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ create: doc }] }),
  });
  if (!res.ok) throw new Error(`create ${member.name}: ${res.status} ${await res.text()}`);

  console.log(`added ${member.name} (${position})${hotspot ? " with hotspot" : ""}`);
}

console.log("done — check the Studio, then the site");
