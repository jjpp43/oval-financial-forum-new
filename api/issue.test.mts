/**
 * Self-check for the issue HTML proxy — `node api/issue.test.mts`.
 * Stubs fetch, so it never hits the Sanity CDN.
 */
import assert from "node:assert/strict";
import handler, { allowedSrc } from "./issue.ts";

assert.equal(
  allowedSrc("https://cdn.sanity.io/files/gkbg7i6n/production/abc.html"),
  true,
);
assert.equal(
  allowedSrc("https://cdn.sanity.io/files/gkbg7i6n/production/abc.html?dl="),
  true,
);
assert.equal(allowedSrc("https://cdn.sanity.io/files/other/production/x.html"), false);
assert.equal(allowedSrc("https://example.com/evil.html"), false);

const call = async (req: unknown) => {
  const out: { code?: number; body?: unknown; type?: string } = {};
  const res = {
    status(c: number) {
      out.code = c;
      return res;
    },
    setHeader(name: string, value: string) {
      if (name === "content-type") out.type = value;
    },
    send(b: string) {
      out.body = b;
    },
    json(b: unknown) {
      out.body = b;
    },
  };
  await handler(req as never, res as never);
  return out;
};

assert.equal((await call({ method: "POST" })).code, 405);
assert.equal(
  (await call({ method: "GET", query: { src: "https://example.com/x.html" } }))
    .code,
  400,
);

globalThis.fetch = (async () => ({
  ok: true,
  text: async () =>
    `<a class="download" href="jul-2026.pdf" download>Download</a>`,
})) as unknown as typeof fetch;

const page = await call({
  method: "GET",
  query: {
    src: "https://cdn.sanity.io/files/gkbg7i6n/production/jul.html",
    pdf: "https://cdn.sanity.io/files/gkbg7i6n/production/jul.pdf",
  },
});
assert.equal(page.code, 200);
assert.equal(page.type, "text/html; charset=utf-8");
assert.match(String(page.body), /href="https:\/\/cdn\.sanity\.io\/files\/gkbg7i6n\/production\/jul\.pdf\?dl="/);

console.log("issue proxy ok");
