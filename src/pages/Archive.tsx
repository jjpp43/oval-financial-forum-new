import { useEffect, useRef } from "react";
import gsap from "gsap";
import PageHead from "../components/PageHead";
import { archive, issues as fallback } from "../content";
import { useIssues } from "../lib/sanity";

/* =============================================================================
 * ROUTE /archive — every published issue
 * Masthead (books banner) then one row per issue: number, title, date, blurb,
 * PDF link, optional duotone cover. Copy: `archive` in content.ts — adding an
 * issue is a row there plus a file in public/issues/.
 * ========================================================================== */
export default function Archive() {
  const root = useRef<HTMLElement>(null);
  const all = useIssues(fallback);
  // newest first, and only editions that are actually out — a placeholder
  // plate belongs on the home row, not in a list of things you can read.
  // filter makes a copy, so reversing it does not disturb the hook's state.
  const issues = all.filter((i) => i.published).reverse();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = gsap.fromTo(
      el.querySelectorAll(".issue-row"),
      { y: 60, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      },
    );

    return () => {
      rows.scrollTrigger?.kill();
      rows.kill();
    };
    // rebuilt when the CMS list lands and changes how many rows there are
  }, [all]);

  return (
    <main>
      <PageHead
        eyebrow={archive.eyebrow}
        headline={archive.headline}
        intro={archive.intro}
        bg="/img/archiveBanner.jpg"
      />

      <section
        ref={root}
        className="px-6 pt-24 pb-32 lg:px-15 lg:pt-32 lg:pb-48"
      >
        {issues.map((issue) => (
          <article
            key={issue.volume}
            className="issue-row grid-page group border-t border-scarlet/25 py-10 lg:py-14"
          >
            <div className="col-span-6 flex items-baseline justify-between lg:col-span-1 lg:col-start-1">
              <span className="label text-label-s text-gray-dark-40">
                {String(issue.volume).padStart(2, "0")}
              </span>
              <span className="label text-label-s text-gray-dark-40 lg:hidden">
                {issue.date}
              </span>
            </div>

            {/* cover sits left of the copy from lg up. It has to come before
                the copy in the DOM too: grid auto-placement is sparse, so an
                item starting at column 2 after the cursor has passed column 6
                would be pushed to a new row. */}
            {issue.cover && (
              <div className="col-span-6 mt-8 aspect-square overflow-hidden lg:col-span-3 lg:col-start-2 lg:mt-0 lg:w-4/5 lg:justify-self-end lg:self-center">
                <img
                  src={issue.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="col-span-6 mt-6 lg:col-span-8 lg:col-start-5 lg:mt-0 lg:self-center">
              <h2 className="text-heading">{issue.title}</h2>
              <p className="label text-label-s mt-2 hidden text-gray-dark-40 lg:block">
                {issue.date}
              </p>
              <p className="label text-label-s mt-5 leading-relaxed text-gray-dark-40">
                {issue.blurb}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={issue.html ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="label text-label-s inline-block bg-scarlet px-5 py-3 text-white transition-opacity duration-200 hover:opacity-80"
                >
                  Read issue
                </a>
                {/* `download` hands the file over instead of opening a viewer.
                    The browser only honours it same-origin, so a PDF from the
                    Sanity CDN carries `?dl=` instead — see lib/sanity.ts. An
                    issue may have no PDF uploaded yet. */}
                {issue.pdf && (
                  <a
                    href={issue.pdf}
                    download
                    className="label text-label-s inline-block border border-scarlet px-5 py-3 text-scarlet transition-colors duration-200 hover:bg-scarlet hover:text-white"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>

          </article>
        ))}
      </section>
    </main>
  );
}
