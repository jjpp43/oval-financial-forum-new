/**
 * GET /api/issue?src=  →  the issue HTML, served from this origin.
 *
 * Sanity's CDN is a different host, so `/fonts` and `/img` inside the file
 * would 404 there. Serving the same bytes here makes those root-relative
 * paths hit the site. Only files from this project's CDN are allowed.
 *
 * `pdf` is optional: a relative Download link in the print bar is rewritten
 * to that URL with `?dl=`, so the button still hands over a file.
 */
type Req = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};
type Res = {
  status: (code: number) => Res;
  setHeader?: (name: string, value: string) => void;
  send?: (body: string) => void;
  json: (body: unknown) => void;
  end?: (body?: string) => void;
};

const PROJECT = "gkbg7i6n";
const FILES = new RegExp(
  `^https://cdn\\.sanity\\.io/files/${PROJECT}/[^?#]+\\.html$`,
);

const param = (req: Req, name: string) => {
  const q = req.query?.[name];
  if (typeof q === "string") return q;
  try {
    return new URL(req.url ?? "", "http://n").searchParams.get(name) ?? "";
  } catch {
    return "";
  }
};

/** True when `src` is an HTML file from this project's public dataset. */
export const allowedSrc = (src: string) => FILES.test(src.split("?")[0] ?? "");

const send = (res: Res, code: number, type: string, body: string) => {
  res.status(code);
  res.setHeader?.("content-type", type);
  if (res.send) res.send(body);
  else if (res.end) res.end(body);
  else res.json({ error: body });
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const src = param(req, "src").split("?")[0];
  if (!allowedSrc(src)) {
    res.status(400).json({ error: "Unknown issue file" });
    return;
  }

  const upstream = await fetch(src);
  if (!upstream.ok) {
    res.status(502).json({ error: "Could not load the issue" });
    return;
  }

  let html = await upstream.text();
  const pdf = param(req, "pdf").split("?")[0];
  if (pdf.startsWith("https://cdn.sanity.io/files/gkbg7i6n/")) {
    html = html.replace(
      /href="(?!https?:)[^"]+\.pdf"/g,
      `href="${pdf}?dl="`,
    );
  }

  res.setHeader?.("cache-control", "public, s-maxage=60, stale-while-revalidate=300");
  send(res, 200, "text/html; charset=utf-8", html);
}
