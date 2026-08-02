/**
 * POST /api/subscribe  { email }  →  Brevo contact.
 *
 * Runs on Vercel as a Node function; the API key never reaches the browser.
 * Env: BREVO_API_KEY (required), BREVO_LIST_ID (optional, comma-separated ids).
 *
 * `vite dev` does not serve this route — use `vercel dev` to exercise it
 * locally, or the field will get a 404 back.
 */
type Req = { method?: string; body?: unknown };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.BREVO_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Subscription is not configured" });
    return;
  }

  // Vercel parses JSON bodies, but a raw string arrives when the content type
  // is anything else
  const body =
    typeof req.body === "string"
      ? (JSON.parse(req.body || "{}") as Record<string, unknown>)
      : ((req.body ?? {}) as Record<string, unknown>);
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!EMAIL.test(email) || email.length > 254) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }

  const listIds = (process.env.BREVO_LIST_ID ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);

  const brevo = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": key,
      "content-type": "application/json",
      accept: "application/json",
    },
    // updateEnabled so a returning address is re-added to the list instead of
    // coming back as duplicate_parameter
    body: JSON.stringify({
      email,
      updateEnabled: true,
      ...(listIds.length ? { listIds } : {}),
    }),
  });

  if (brevo.ok) {
    res.status(200).json({ ok: true });
    return;
  }

  const detail = (await brevo.text()).slice(0, 500);
  console.error("brevo subscribe failed", brevo.status, detail);
  res.status(502).json({ error: "Could not subscribe right now" });
}
