/**
 * Self-check for the subscribe handler — `node api/subscribe.test.mts`.
 * Stubs fetch, so it never touches Brevo.
 */
import assert from "node:assert";
import handler from "./subscribe.ts";

const call = async (req: unknown, env: Record<string, string> = {}) => {
  Object.assign(process.env, { BREVO_API_KEY: "k", BREVO_LIST_ID: "3" }, env);
  const out: { code?: number; body?: unknown } = {};
  const res = {
    status(c: number) {
      out.code = c;
      return res;
    },
    json(b: unknown) {
      out.body = b;
    },
  };
  // deliberately loose: the handler's Req/Res are structural
  await handler(req as never, res as never);
  return out;
};

let sent: unknown = null;
const okFetch = (async (_url: string, init: { body: string }) => {
  sent = JSON.parse(init.body);
  return { ok: true, status: 200, text: async () => "" };
}) as unknown as typeof fetch;

globalThis.fetch = okFetch;
assert.equal((await call({ method: "GET" })).code, 405);
assert.equal((await call({ method: "POST", body: { email: "nope" } })).code, 400);

assert.equal((await call({ method: "POST", body: '{"email":"a@b.co"}' })).code, 200);
assert.deepEqual(sent, { email: "a@b.co", updateEnabled: true, listIds: [3] });

// no list configured — the contact is still created, just unlisted
assert.equal(
  (await call({ method: "POST", body: { email: "a@b.co" } }, { BREVO_LIST_ID: "" })).code,
  200,
);
assert.deepEqual(sent, { email: "a@b.co", updateEnabled: true });

globalThis.fetch = (async () => ({
  ok: false,
  status: 401,
  text: async () => "bad key",
})) as unknown as typeof fetch;
assert.equal((await call({ method: "POST", body: { email: "a@b.co" } })).code, 502);

globalThis.fetch = okFetch;
assert.equal(
  (await call({ method: "POST", body: { email: "a@b.co" } }, { BREVO_API_KEY: "" })).code,
  500,
);

// honeypot: answered 200, but nothing was sent to Brevo
globalThis.fetch = okFetch;
sent = null;
assert.equal(
  (
    await call({
      method: "POST",
      body: { email: "a@b.co", company: "spam corp" },
      headers: { "x-forwarded-for": "9.9.9.9" },
    })
  ).code,
  200,
);
assert.equal(sent, null);

// rate limit: 6th attempt from one IP inside the window is refused
const ip = { "x-forwarded-for": "5.5.5.5" };
for (let i = 0; i < 5; i++) {
  assert.equal(
    (await call({ method: "POST", body: { email: `a${i}@b.co` }, headers: ip })).code,
    200,
  );
}
assert.equal(
  (await call({ method: "POST", body: { email: "a6@b.co" }, headers: ip })).code,
  429,
);
// a different IP still gets through
assert.equal(
  (
    await call({
      method: "POST",
      body: { email: "b@b.co" },
      headers: { "x-forwarded-for": "6.6.6.6" },
    })
  ).code,
  200,
);

console.log("api/subscribe: ok");
