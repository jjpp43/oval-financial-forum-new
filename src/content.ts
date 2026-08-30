/* =============================================================================
 * ALL SITE COPY. Nothing is hardcoded in a component except the hero's two
 * wordmark lines. Each export below feeds one part of the site:
 *
 *   studio    → nav wordmark, footer copyright, mailto links
 *   nav       → the centred links in the fixed bar
 *   hero      → HOME section 1 (subscribe hint)
 *   intro     → HOME section 2, the scarlet statement band
 *   services  → HOME section 3, "We Present" accordion rows
 *   approach  → HOME section 4, the four tilted step cards
 *   work      → HOME section 5, "Monthly Newsletter" issue row
 *   issues    → the editions themselves, shared by that row and /archive
 *   team      → HOME section 6 + the /team grid, and every bio
 *   archive   → /archive masthead
 *   apply     → /apply masthead, points, recruitment timeline, CTA, load prompt
 *   contact   → footer subscribe hint
 *
 * `issues` and `team.members` are the two entries here that are only
 * *fallbacks* — the live values come from Sanity (see lib/sanity.ts), so
 * editing them changes what shows when the CMS is empty or unreachable, not
 * what members see day to day.
 * ========================================================================== */
import type { Issue } from "./lib/sanity";

export const studio = {
  name: "The Oval Financial Forum",
  tagline:
    "An Ohio State student finance club that publishes a monthly financial newsletter.",
  email: "ovalfinancialforum@gmail.com",
  location: "Columbus, OH",
  instagram: "https://www.instagram.com/ovalfinancialforum/",
  linkedin: "https://www.linkedin.com/company/the-oval-financial-forum/",
};

export const nav = [
  { label: "Archive", href: "/archive" },
  { label: "Team", href: "/team" },
  { label: "Join Us", href: "/apply" },
];

export const hero = {
  eyebrow: "The Oval Financial Forum",
  headline: "",
  intro:
    "",
  newsletterHint: "Enter your email to subscribe to our newsletter",
};

// Blue full-bleed statement — second section, sets the whole tone.
export const intro = {
  eyebrow: "Who we are",
  statement:
    "An environment of OSU students driven to learn macroeconomics and geopolitics.",
  note: "No AI written material is used for our newsletter.",
};

export const services = {
  eyebrow: "What we do",
  items: [
    {
      title: "Market Overview",
      body: "A snapshot of the biggest market moves, key indices, and the stories driving sentiment.",
    },
    {
      title: "Macroeconomics & Geopolitics",
      body: "Breaking down economic data, central bank decisions, and global events that shape financial markets.",
    },
    {
      title: "Sector Analysis",
      body: "Identifying the industries gaining momentum, facing headwinds, and where capital is flowing.",
    },
    {
      title: "Company Deepdive",
      body: "In-depth research on notable companies, earnings, competitive advantages, and long-term outlooks.",
    },
    {
      title: "OSU Fun Fact",
      body: "A lighthearted fact or campus insight to end each edition with something memorable.",
    },
  ],
};

export const approach = {
  eyebrow: "How it goes",
  headline: "Our Publication Process",
  steps: [
    {
      title: "Research",
      body: "Members track markets, macro data, and company filings through the month, then claim the sections they will cover.",
    },
    {
      title: "Drafting",
      body: "Each member writes their assigned section independently. Drafts are factual and all claims require sourced backing.",
    },
    {
      title: "Editorial Review",
      body: "The Editor-in-Chief reviews every section for accuracy and adherence to the forum's editorial standards.",
    },
    {
      title: "Copy & Publication",
      body: "The VP of Copy & Standards performs a final edit for clarity and consistency.",
    },
  ],
};

export const work = {
  eyebrow: "Archive",
  headline: "Monthly Newsletter",
  soonLabel: "Coming up soon!",
};

/**
 * Every edition, feeding both the home row and /archive. Fallback copy only —
 * the live list is the `newsletterIssue` type in Sanity, and members add
 * editions there, not here. An issue with no `html` shows as the dotted plate
 * counting down to `due`.
 */
export const issues: Issue[] = [
  {
    volume: 1,
    title: "June Edition",
    blurb:
      "The Fed's third hold of the year, what the futures market is pricing, and why the labour data keeps contradicting itself.",
    cover: "/img/june.jpg",
    // both files live in public/newsletter/; in Sanity they are uploads
    html: "/newsletter/2026/june-2026.html",
    pdf: "/newsletter/2026/june-2026.pdf",
    date: "Published : 07/19/2026",
    published: true,
    due: "",
  },
  {
    volume: 2,
    title: "July Edition",
    blurb:
      "AI valuations wobbled, Brent crude topped $100, and the Fed held for a fifth session while financials led the Dow.",
    cover: "/img/aug.jpg",
    html: "/newsletter/2026/jul-2026.html",
    pdf: "/newsletter/2026/jul-2026.pdf",
    date: "Published : 08/26/2026",
    published: true,
    due: "",
  },
];

export const team = {
  eyebrow: "Who runs it",
  headline: "Meet the team",
  // 9 members fills the 3x3 grid exactly. Add or remove freely — the grid
  // reflows; it just stops being a clean 3x3.
  members: [
    // Photos are real. ROLES AND BIOS ARE PLACEHOLDERS — replace them.
    // An empty bio hides the "Show bio" control for that member.
    // `focus` sets the square crop's focal point (CSS object-position).
    // Only needed for non-square source images; square ones ignore it.
    { name: "Evan Tercek", role: "President", photo: "/team/Evan_Tercek_compressed.png", bio: "Evan is a second-year accounting student at the Fisher College of Business from Cleveland, Ohio, with interests in entrepreneurship, wealth management, and corporate finance. Outside of the forum, he enjoys golf, running, and Bibibop.", linkedin: "https://www.linkedin.com/in/evantercek/", email: "tercek.1@osu.edu" },
    { name: "William Alt", role: "Editor-in-Chief", photo: "/team/Will_Alt_compressed.png", bio: "Will is a second-year finance and accounting student at the Fisher College of Business from Cincinnati, Ohio, with interests in wealth management and corporate finance.  Outside of the forum, he enjoys guitar, baseball, and lifting.", linkedin: "https://www.linkedin.com/in/william-alt-ba15b2383/", email: "alt.101@osu.edu" },
    { name: "Charlie Hahn", role: "Senior VP, Operations", photo: "/team/Charlie_Hahn_compressed.png", bio: "Charlie is a second-year finance student at the Fisher College of Business from Allentown, Pennsylvania, with interests in banking.  Outside of the forum, he enjoys baseball, Philadelphia sports, working out, and traveling.", linkedin: "https://www.linkedin.com/in/charlie-hahn007/", email: "hahn.482@osu.edu" },
    { name: "Benjamin Schwartz", role: "VP, New Member Development", photo: "/team/Ben_Schwartz_compressed.png", bio: "Benjamin is a second-year finance student at the Fisher College of Business from Sudbury, Massachusetts, with a minor in business analytics. His professional interests include consulting, corporate finance, and entrepreneurship.  Outside of the forum, he enjoys fitness, food, sports, traveling, and music.", linkedin: "https://www.linkedin.com/in/benschwartz01776/", email: "schwartz.2429@osu.edu" },
    { name: "Evie Schwartz", role: "VP, New Member Development", photo: "/team/Evie_Schwartz_compressed.png", bio: "Evie is a second-year transfer student studying finance at the Fisher College of Business from Sudbury, Massachusetts, with interests in private equity and corporate finance.  Outside of the forum, she enjoys basketball, concerts, and traveling.", linkedin: "https://www.linkedin.com/in/evieschwartz/", email: "schwartz.2527@osu.edu" },
    { name: "Charlie Slate", role: "VP, Marketing", photo: "/team/Charlie_Slate_compressed.png", bio: "Charlie is a second-year marketing student at the Fisher College of Business from Boston, Massachusetts, with interests in entrepreneurship.  Outside of the forum, he enjoys hockey, pickleball, and reading.", linkedin: "https://www.linkedin.com/in/charlesmslate/", email: "slate.45@osu.edu" },
    { name: "George Bradbury", role: "VP, Finance & Strategy", photo: "/team/George_Bradbury_compressed.png", bio: "George is a second-year finance and economics student at the Fisher College of Business from West Chester, Ohio, with a minor in history and membership in the Dean's Leadership Academy. His professional interests include law and fiscal policy.  Outside of the forum, he enjoys photography, water polo, tennis, rock music, and traveling.", linkedin: "https://www.linkedin.com/in/georgewbradbury/", email: "bradbury.61@osu.edu" },
    { name: "Benjamin Bury", role: "VP, Copy & Standards", photo: "/team/Benjamin_Bury_compressed.png", bio: "Benjamin is a second-year accounting student at the Fisher College of Business from Toledo, Ohio, with interests in wealth management.  Outside of the forum, he enjoys exercising and spending time outdoors.", linkedin: "https://www.linkedin.com/in/benjamin-bury-0648a6354/", email: "bury.43@osu.edu" },
    { name: "Junna Park", role: "Technology Lead", photo: "/team/Junna_Park_compressed.png", bio: "Junna is a rising senior computer science major at the College of Engineering from South Korea, with interests in entrepreneurship and AI.  Outside of the forum, he enjoys doing hackathons, judo, and watching the UFC.", linkedin: "https://www.linkedin.com/in/junnapark3636/", email: "park.3636@osu.edu" },
  ],
};

/* ---- /archive -----------------------------------------------------------
 * One entry per published issue, newest first. `pdf` is served straight from
 * public/, so dropping a file in public/issues/ and adding a row here is the
 * whole publishing step. `cover` is optional — issues without one fall back
 * to a scarlet plate with the issue number.
 * PLACEHOLDER ROWS — replace with the real issues.
 * ------------------------------------------------------------------------- */
export const archive = {
  eyebrow: "Every issue",
  headline: "Archive",
  intro:
    "Every issue we have published, free to read. New editions land each month.",
};

/* ---- /apply -------------------------------------------------------------
 * `formUrl` is the Apply button's href — the Google Form's share link
 * (the /viewform URL, not the embed). Empty falls back to mailto.
 * ------------------------------------------------------------------------- */
export const apply = {
  eyebrow: "Join us",
  headline: "Write with us.",
  intro:
    "Applications for our founding member class open this August.",
  formUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSe4dwRvRjGtOnbNGcZaib9ZM0bpgEYIWZfXRPyZJbOeTDzKjQ/viewform",
  cta: "Fill out our interest form",
  prompt: {
    headline: "Applications are open for Fall 2026.",
    dismiss: "Close",
  },
  points: [
    {
      title: "Who we look for",
      body: "Open to any Ohio State student with the drive to learn deeply.\nNo finance background is required.",
      note: "*Attendance to at least one info session is required to apply."
    },
  ],
  timeline: {
    headline: "Timeline",
    events: [
      {
        at: "2026-08-31T19:00",
        month: "August",
        day: "31",
        weekday: "Monday",
        time: "7-8 PM",
        title: "Info session I",
        location: "Enarson 258",
      },
      {
        at: "2026-09-02T20:30",
        month: "September",
        day: "2",
        weekday: "Wednesday",
        time: "8:30-9:30 PM",
        title: "Info session II",
        location: "Enarson 258",
      },
      {
        at: "2026-09-06T19:00",
        month: "September",
        day: "6",
        weekday: "Sunday",
        time: "7-8 PM",
        title: "Make-up session",
        location: "Virtual",
      },
      {
        at: "2026-09-07T23:59",
        month: "September",
        day: "7",
        weekday: "Monday",
        time: "11:59 PM",
        title: "Application Due",
        location: "Google Form",
      },
    ],
  },
};

/* ---- footer -------------------------------------------------------------
 * Only `body` is rendered — it is the hint under the footer subscribe field.
 * The eyebrow and headline are leftovers from the old contact section.
 * ------------------------------------------------------------------------- */
export const contact = {
  eyebrow: "Start something",
  headline: "Tell us what is broken.",
  body: "We publish our newsletter every month. Subscribe to our newsletter to learn more!",
};

/* ---- search / social ----------------------------------------------------
 * Titles and descriptions for <title>, meta, Open Graph. The origin is the
 * live site — canonical and og:url are built from it. Copy: keep "finance
 * club" and "Ohio State" in the home title so a search for those words can
 * match what the page actually says.
 * ------------------------------------------------------------------------- */
export const origin = "https://www.ovalfinancialforum.com";

export const seo = {
  origin,
  title: "Oval Financial Forum | OSU Finance Club",
  description:
    "Oval Financial Forum is an Ohio State student finance club. We write a monthly newsletter on markets, macroeconomics, and geopolitics.",
  image: "/img/logo_dark.png",
  pages: {
    "/": {
      title: "Oval Financial Forum | OSU Finance Club",
      description:
        "Oval Financial Forum is an Ohio State student finance club. We write a monthly newsletter on markets, macroeconomics, and geopolitics.",
    },
    "/archive": {
      title: "Newsletter Archive | Oval Financial Forum",
      description:
        "Read every Oval Financial Forum edition. A monthly financial newsletter written by Ohio State students.",
    },
    "/team": {
      title: "The Team | Oval Financial Forum",
      description:
        "Meet the Ohio State students who write and edit the Oval Financial Forum, OSU’s student finance club newsletter.",
    },
    "/apply": {
      title: "Join Us | Oval Financial Forum",
      description:
        "Apply to Oval Financial Forum, Ohio State’s student finance club. Open to any OSU student — no finance background required.",
    },
  } satisfies Record<string, { title: string; description: string }>,
};
