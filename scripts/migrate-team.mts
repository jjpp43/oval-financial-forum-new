/**
 * One-shot import of the 9 team members from the previous site's Sanity project
 * into ours. The old project is publicly readable, so only the write side needs
 * a token.
 *
 *   node --env-file=.env.local scripts/migrate-team.mts
 *
 * Needs SANITY_WRITE_TOKEN in .env.local — Manage → API → Tokens on project
 * gkbg7i6n, with Editor permission. The token is write-capable: keep it out of
 * git and out of anything prefixed VITE_, which ships to the browser.
 *
 * Safe to re-run. It skips anyone already in the dataset, matching on name, so
 * a half-finished run resumes instead of duplicating people.
 */
import assert from "node:assert/strict";

const FROM = "mndx0824"; // previous site's project — public, not ours
const TO = "gkbg7i6n";
const DATASET = "production";
const API = "v2024-01-01";

const token = process.env.SANITY_WRITE_TOKEN;
assert(token, "SANITY_WRITE_TOKEN missing — see the header of this file");

const auth = { Authorization: `Bearer ${token}` };

const query = async (project: string, groq: string) => {
  const url = `https://${project}.api.sanity.io/${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  // the source project is public, so only our own reads carry the token
  const res = await fetch(url, project === TO ? { headers: auth } : undefined);
  if (!res.ok) throw new Error(`${project} query ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
};

/**
 * The old project stored bios as two paragraphs and called the role `title`.
 * It also had no hotspot, so the two non-square portraits relied on a CSS
 * object-position hardcoded in the site. Those become real hotspots here,
 * which is what retires that hack.
 */
const HOTSPOTS: Record<string, { x: number; y: number }> = {
  "Evan Tercek": { x: 0.5, y: 0.18 },
  "Junna Park": { x: 0.5, y: 0.9 },
};

type OldMember = {
  name: string;
  role: string | null;
  bio: string;
  order: number;
  photo: string | null;
};

const source: OldMember[] = await query(
  FROM,
  `*[_type == "teamMember"] | order(order asc) {
     name,
     "role": title,
     "bio": coalesce(bioMain, "") + " " + coalesce(bioOutside, ""),
     order,
     "photo": photo.asset->url
   }`,
);
console.log(`found ${source.length} members in ${FROM}`);

const existing: string[] = await query(TO, `*[_type == "teamMember"].name`);
if (existing.length) console.log(`already in ${TO}: ${existing.join(", ")}`);

/** Streams the image straight from one CDN to the other — no temp files. */
async function uploadPhoto(url: string, name: string) {
  const image = await fetch(url);
  if (!image.ok) throw new Error(`fetch photo for ${name}: ${image.status}`);
  const res = await fetch(
    `https://${TO}.api.sanity.io/${API}/assets/images/${DATASET}?filename=${encodeURIComponent(name)}.jpg`,
    {
      method: "POST",
      headers: { ...auth, "Content-Type": image.headers.get("content-type") ?? "image/jpeg" },
      body: Buffer.from(await image.arrayBuffer()),
    },
  );
  if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
  return (await res.json()).document._id as string;
}

for (const member of source) {
  if (existing.includes(member.name)) {
    console.log(`skip  ${member.name} — already there`);
    continue;
  }
  assert(member.photo, `${member.name} has no photo in ${FROM}`);

  const assetId = await uploadPhoto(member.photo, member.name);
  const hotspot = HOTSPOTS[member.name];

  const doc = {
    _type: "teamMember",
    name: member.name,
    role: member.role ?? "",
    bio: member.bio.trim(),
    order: member.order,
    photo: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      // Sanity wants a crop alongside a hotspot; a full-frame one means
      // "nothing trimmed", leaving the hotspot to do the work
      ...(hotspot && {
        hotspot: { _type: "sanity.imageHotspot", ...hotspot, height: 1, width: 1 },
        crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
      }),
    },
  };

  const res = await fetch(`https://${TO}.api.sanity.io/${API}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ create: doc }] }),
  });
  if (!res.ok) throw new Error(`create ${member.name}: ${res.status} ${await res.text()}`);

  console.log(`added ${member.name}${hotspot ? " (with hotspot)" : ""}`);
}

console.log("done — check the Studio, then the site");
