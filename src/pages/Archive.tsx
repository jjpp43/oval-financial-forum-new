import { useEffect, useRef } from "react";
import gsap from "gsap";
import Duotone from "../components/Duotone";
import PageHead from "../components/PageHead";
import { archive } from "../content";

/* =============================================================================
 * ROUTE /archive — every published issue
 * Masthead (books banner) then one row per issue: number, title, date, blurb,
 * PDF link, optional duotone cover. Copy: `archive` in content.ts — adding an
 * issue is a row there plus a file in public/issues/.
 * ========================================================================== */
export default function Archive() {
  const root = useRef<HTMLElement>(null);

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
  }, []);

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
        {archive.issues.map((issue) => (
          <article
            key={issue.number}
            className="issue-row grid-page group border-t border-scarlet/25 py-10 lg:py-14"
          >
            <div className="col-span-6 flex items-baseline justify-between lg:col-span-2">
              <span className="label text-label-s text-gray-dark-40">
                {issue.number}
              </span>
              <span className="label text-label-s text-gray-dark-40 lg:hidden">
                {issue.date}
              </span>
            </div>

            <div className="col-span-6 mt-6 lg:col-span-4 lg:mt-0">
              <h2 className="text-heading">{issue.title}</h2>
              <p className="label text-label-s mt-2 hidden text-gray-dark-40 lg:block">
                {issue.date}
              </p>
              <p className="label text-label-s mt-5 leading-relaxed text-gray-dark-40">
                {issue.blurb}
              </p>
              <a
                href={issue.pdf}
                target="_blank"
                rel="noreferrer"
                className="label text-label-s mt-6 inline-block bg-scarlet px-5 py-3 text-white transition-opacity duration-200 hover:opacity-80"
              >
                Read issue (PDF)
              </a>
            </div>

            {issue.cover && (
              <div className="col-span-6 mt-8 aspect-4/5 overflow-hidden lg:col-span-3 lg:col-start-9 lg:mt-0">
                <Duotone src={issue.cover} />
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
