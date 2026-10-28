/**
 * Creates the September edition in Sanity from the files in public/ and the
 * copy in src/content.ts.
 *
 *   node --env-file=.env.local scripts/seed-sep-issue.mts
 *
 * Needs SANITY_EDIT_API_KEY — same token as the other issue seeders.
 * Safe to re-run: it stops if volume 4 is already there.
 *
 * The HTML we upload rewrites /fonts to the live origin, because the Studio
 * serves the file from Sanity's CDN, not from this site.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { issues } from "../src/content.ts";

const PROJECT = "gkbg7i6n";
const DATASET = "production";
const API = "v2024-01-01";
const ORIGIN = "https://www.ovalfinancialforum.com";

const token = process.env.SANITY_EDIT_API_KEY;
assert(token, "SANITY_EDIT_API_KEY missing — see the header of this file");
const auth = { Authorization: `Bearer ${token}` };

const sep = issues.find((i) => i.volume === 4);
assert(sep?.html && sep.pdf && sep.cover, "no published Vol.4 in content.ts");

const existing = await (
  await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/data/query/${DATASET}?query=${encodeURIComponent(
      `count(*[_type == "newsletterIssue" && volume == 4])`,
    )}`,
    { headers: auth },
  )
).json();
if (existing.result > 0) {
  console.log("Vol.4 already in the dataset — nothing to do");
  process.exit(0);
}

async function upload(
  kind: "images" | "files",
  path: string,
  mime: string,
  body?: Buffer,
) {
  const name = path.split("/").pop()!;
  const bytes =
    body ?? (await readFile(new URL(`../public${path}`, import.meta.url)));
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/assets/${kind}/${DATASET}?filename=${encodeURIComponent(name)}`,
    { method: "POST", headers: { ...auth, "Content-Type": mime }, body: bytes },
  );
  if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
  console.log(`uploaded ${name} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  return (await res.json()).document._id as string;
}

const htmlBytes = Buffer.from(
  (await readFile(new URL(`../public${sep.html}`, import.meta.url), "utf8"))
    .replaceAll('url("/fonts/', `url("${ORIGIN}/fonts/`)
    .replaceAll('src="/img/', `src="${ORIGIN}/img/`),
);

const [cover, html, pdf] = await Promise.all([
  upload("images", sep.cover, "image/jpeg"),
  upload("files", sep.html, "text/html", htmlBytes),
  upload("files", sep.pdf, "application/pdf"),
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
          volume: 4,
          title: sep.title,
          blurb: sep.blurb,
          publishedAt: "2026-10-13",
          cover: { _type: "image", asset: { _type: "reference", _ref: cover } },
          html: file(html),
          pdf: file(pdf),
        },
      },
    ],
  }),
});
if (!res.ok) throw new Error(`create: ${res.status} ${await res.text()}`);

console.log("created Vol.4 — check the Studio, then /archive");
