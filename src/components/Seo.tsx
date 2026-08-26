import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { origin, seo, studio } from "../content";

/** Sets one meta tag, creating it if the document does not already have it. */
function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const jsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: studio.name,
  alternateName: ["Oval Financial Forum", "OSU Finance Club"],
  url: origin,
  logo: `${origin}${seo.image}`,
  description: seo.description,
  email: studio.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Columbus",
    addressRegion: "OH",
    addressCountry: "US",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "The Ohio State University",
    url: "https://www.osu.edu",
  },
  sameAs: [studio.instagram, studio.linkedin],
});

/* =============================================================================
 * DOCUMENT HEAD — title, description, canonical, Open Graph, JSON-LD
 * Runs on every pathname so /archive and /apply do not keep the home title.
 * Copy: `seo` in content.ts. Mount once, inside the router.
 * ========================================================================== */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = seo.pages[pathname as keyof typeof seo.pages] ?? {
      title: seo.title,
      description: seo.description,
    };
    const url = `${origin}${pathname === "/" ? "/" : pathname}`;
    const image = `${origin}${seo.image}`;

    document.title = page.title;
    setMeta("name", "description", page.description);
    setLink("canonical", url);

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", studio.name);
    setMeta("property", "og:locale", "en_US");
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);

    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.description);
    setMeta("name", "twitter:image", image);

    let ld = document.getElementById("ld-org");
    if (!ld) {
      ld = document.createElement("script");
      ld.id = "ld-org";
      ld.setAttribute("type", "application/ld+json");
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify(jsonLd());
  }, [pathname]);

  return null;
}
