/**
 * Creates the August edition in Sanity from the files in public/ and the
 * copy in src/content.ts.
 *
 *   node --env-file=.env.local scripts/seed-aug-issue.mts
 *
 * Needs SANITY_EDIT_API_KEY — same token as the team migration.
 * Safe to re-run: it stops if volume 2 is already there.
 *
 * The HTML we upload rewrites /fonts and /img to the live origin, because
 * the Studio serves the file from Sanity's CDN, not from this site.
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

const aug = issues.find((i) => i.volume === 2);
assert(aug?.html && aug.pdf && aug.cover, "no published Vol.2 in content.ts");

const existing = await (
  await fetch(
    `https://${PROJECT}.api.sanity.io/${API}/data/query/${DATASET}?query=${encodeURIComponent(
      `count(*[_type == "newsletterIssue" && volume == 2])`,
    )}`,
    { headers: auth },
  )
).json();
if (existing.result > 0) {
  console.log("Vol.2 already in the dataset — nothing to do");
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
  (await readFile(new URL(`../public${aug.html}`, import.meta.url), "utf8"))
    .replaceAll('url("/fonts/', `url("${ORIGIN}/fonts/`)
    .replaceAll('src="/img/', `src="${ORIGIN}/img/`)
    .replaceAll(
      'href="aug-2026.pdf"',
      `href="${ORIGIN}/newsletter/2026/aug-2026.pdf"`,
    ),
);

const [cover, html, pdf] = await Promise.all([
  upload("images", aug.cover, "image/jpeg"),
  upload("files", aug.html, "text/html", htmlBytes),
  upload("files", aug.pdf, "application/pdf"),
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
          volume: 2,
          title: aug.title,
          blurb: aug.blurb,
          publishedAt: "2026-08-26",
          cover: { _type: "image", asset: { _type: "reference", _ref: cover } },
          html: file(html),
          pdf: file(pdf),
        },
      },
    ],
  }),
});
if (!res.ok) throw new Error(`create: ${res.status} ${await res.text()}`);

console.log("created Vol.2 — check the Studio, then /archive");
