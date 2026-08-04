/**
 * Creates the June edition in Sanity from what the repo already ships: the
 * cover in public/img/, the HTML and PDF in public/newsletter/2026/, and the
 * copy in src/content.ts.
 *
 *   node --env-file=.env.local scripts/seed-june-issue.mts
 *
 * Needs SANITY_EDIT_API_KEY — same token as the team migration.
 *
 * Only the first edition needs this. Every issue after it is created in the
 * Studio by whoever is publishing, which is the whole point of the CMS.
 * Safe to re-run: it stops if the volume is already there.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { issues } from "../src/content.ts";

const PROJECT = "gkbg7i6n";
const DATASET = "production";
const API = "v2024-01-01";

const token = process.env.SANITY_EDIT_API_KEY;
assert(token, "SANITY_EDIT_API_KEY missing — see the header of this file");
const auth = { Authorization: `Bearer ${token}` };

const june = issues.find((i) => i.volume === 1);
assert(june?.html && june.pdf && june.cover, "no published Vol.1 in content.ts");

const existing = await (
  await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/data/query/${DATASET}?query=${encodeURIComponent(
      `count(*[_type == "newsletterIssue" && volume == 1])`,
    )}`,
    { headers: auth },
  )
).json();
if (existing.result > 0) {
  console.log("Vol.1 already in the dataset — nothing to do");
  process.exit(0);
}

/** Uploads one file from public/ and returns the asset id to reference. */
async function upload(kind: "images" | "files", path: string, mime: string) {
  const name = path.split("/").pop()!;
  const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/assets/${kind}/${DATASET}?filename=${encodeURIComponent(name)}`,
    { method: "POST", headers: { ...auth, "Content-Type": mime }, body: bytes },
  );
  if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
  console.log(`uploaded ${name} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  return (await res.json()).document._id as string;
}

const [cover, html, pdf] = await Promise.all([
  upload("images", june.cover, "image/jpeg"),
  upload("files", june.html, "text/html"),
  upload("files", june.pdf, "application/pdf"),
]);

const file = (_ref: string) => ({ _type: "file", asset: { _type: "reference", _ref } });

const res = await fetch(`https://${PROJECT}.api.sanity.io/${API}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({
    mutations: [
      {
        create: {
          _type: "newsletterIssue",
          volume: 1,
          title: june.title,
          blurb: june.blurb,
          // content.ts stores the rendered label; the CMS wants the date
          publishedAt: "2026-07-19",
          cover: { _type: "image", asset: { _type: "reference", _ref: cover } },
          html: file(html),
          pdf: file(pdf),
        },
      },
    ],
  }),
});
if (!res.ok) throw new Error(`create: ${res.status} ${await res.text()}`);

console.log("created Vol.1 — check the Studio, then /archive");
