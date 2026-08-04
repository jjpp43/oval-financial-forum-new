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
 *   team      → HOME section 6 + the /team grid, and every bio
 *   archive   → /archive masthead + one entry per published issue
 *   apply     → /apply masthead, its three points, and the form URL
 *   contact   → footer subscribe hint
 * ========================================================================== */

export const studio = {
  name: "The Oval Financial Forum",
  tagline: "Student organization publishing financial newsletter monthly.",
  email: "ovalfinancialforum@gmail.com",
  location: "Columbus, OH",
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
  " An enviorment of OSU students driven to learn macroeconomics and geopolitics."
    ,
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
  items: [
    {
      client: "June Edition",
      sector: "Vol.1",
      year: "2026",
      role: "Identity, site, design system",
      body: "",
      tone: "ink",
      cover: "/img/june.jpg",
      href: "/newsletter/2026/june-2026.html",
    },
    // only one issue is out, so the row shows it plus the next one due. The
    // grid takes one column per item, up to 4 — add editions here as they land.
    { client: "", sector: "Vol.2", year: "", role: "", body: "", tone: "ink", soon: "July 2026" },
  ],
  soonLabel: "Coming up soon!",
};

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
    { name: "Evan Tercek", role: "President", photo: "/team/Evan_Tercek.jpeg", bio: "Evan is a first-year accounting student at the Fisher College of Business from Cleveland, Ohio, with interests in entrepreneurship, wealth management, and corporate finance. Outside of the forum, he enjoys golf, running, and Bibibop.", focus: "center 18%" },
    { name: "William Alt", role: "Editor-in-Chief", photo: "/team/William_Alt.jpeg", bio: "Will is a first-year finance and accounting student at the Fisher College of Business from Cincinnati, Ohio, with interests in wealth management and corporate finance.  Outside of the forum, he enjoys guitar, baseball, and lifting." },
    { name: "Charlie Hahn", role: "Senior VP, Operations", photo: "/team/Charlie_Hahn.jpeg", bio: "Charlie is a first-year finance student at the Fisher College of Business from Allentown, Pennsylvania, with interests in banking.  Outside of the forum, he enjoys baseball, Philadelphia sports, working out, and traveling." },
    { name: "Benjamin Schwartz", role: "VP, New Member Development", photo: "/team/Benjamin_Schwartz.jpeg", bio: "Benjamin is a first-year finance student at the Fisher College of Business from Sudbury, Massachusetts, with a minor in business analytics. His professional interests include consulting, corporate finance, and entrepreneurship.  Outside of the forum, he enjoys fitness, food, sports, traveling, and music." },
    { name: "Evie Schwartz", role: "VP, New Member Development", photo: "/team/Evie_Schwartz.jpeg", bio: "Evie is a first-year transfer student studying finance at the Fisher College of Business from Sudbury, Massachusetts, with interests in private equity and corporate finance.  Outside of the forum, she enjoys basketball, concerts, and traveling." },
    { name: "Charlie Slate", role: "VP, Marketing", photo: "/team/Charlie_Slate.jpeg", bio: "Charlie is a first-year marketing student at the Fisher College of Business from Boston, Massachusetts, with interests in entrepreneurship.  Outside of the forum, he enjoys hockey, pickleball, and reading." },
    { name: "George Bradbury", role: "VP, Finance & Strategy", photo: "/team/George_Bradbury.jpeg", bio: "George is a first-year finance and economics student at the Fisher College of Business from West Chester, Ohio, with a minor in history and membership in the Dean's Leadership Academy. His professional interests include law and fiscal policy.  Outside of the forum, he enjoys photography, water polo, tennis, rock music, and traveling." },
    { name: "Benjamin Bury", role: "VP, Copy & Standards", photo: "/team/Benjamin_Bury.jpeg", bio: "Benjamin is a first-year accounting student at the Fisher College of Business from Toledo, Ohio, with interests in wealth management.  Outside of the forum, he enjoys exercising and spending time outdoors." },
    { name: "Junna Park", role: "Technology Lead", photo: "/team/Junna_Park.jpeg", bio: "Junna is a rising senior computer science major at the College of Engineering from South Korea, with interests in entrepreneurship and AI.  Outside of the forum, he enjoys doing hackathons, judo, and watching the UFC.", focus: "center 90%" },
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
  issues: [
    {
      number: "01",
      title: "June Edition",
      date: "Published : 07/19/2026",
      blurb:
        "The Fed's third hold of the year, what the futures market is pricing, and why the labour data keeps contradicting itself.",
      // `html` is the issue to read in the browser, `pdf` the file the
      // download button hands over — both live in public/newsletter/
      html: "/newsletter/2026/june-2026.html",
      pdf: "/newsletter/2026/june-2026.pdf",
      cover: "/img/june.jpg",
    }
  ],
};

/* ---- /apply -------------------------------------------------------------
 * `formUrl` must be the Google Form's EMBED url — open the form, Send →
 * <> → copy the src from the iframe. It ends in /viewform?embedded=true.
 * A plain /viewform link renders but refuses to submit inside a frame.
 * ------------------------------------------------------------------------- */
export const apply = {
  eyebrow: "Join us",
  headline: "Write with us.",
  intro:
    "Applications for our founding member class open August 2026. We'll see you then.",
  formUrl: "",
  points: [
    {
      title: "Who we look for",
      body: "Open to any Ohio State student with the drive to learn deeply. No previous experience required.",
    },
    
  ],
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
