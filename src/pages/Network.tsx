import { useEffect, useRef } from "react";
import gsap from "gsap";
import PageHead from "../components/PageHead";
import { network } from "../content";

/* =============================================================================
 * ROUTE /network — "Our Network" in the nav
 * Masthead, then one band per connection: photos, title under them.
 * Copy: `network` in content.ts.
 * ========================================================================== */
export default function Network() {
  const root = useRef<HTMLElement>(null);
  const entries = network.entries;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = gsap.fromTo(
      el.querySelectorAll(".network-row"),
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
  }, [entries]);

  return (
    <main>
      <PageHead
        eyebrow={network.eyebrow}
        headline={network.headline}
        intro={network.intro}
        bg="/img/archiveBanner2.jpeg"
      />

      <section
        ref={root}
        className="px-6 pt-24 pb-32 lg:px-15 lg:pt-32 lg:pb-48"
      >
        {entries.map((entry, i) => (
          <article
            key={`${entry.title}-${i}`}
            className="network-row grid-page group border-t border-scarlet/25 py-10 lg:py-14"
          >
            {entry.covers && entry.covers.length > 0 && (
              <div className="col-span-6 grid grid-cols-1 gap-3 lg:col-span-8 lg:col-start-1 lg:grid-cols-2">
                {entry.covers.map((src, photo) => (
                  <div
                    key={src}
                    className={`overflow-hidden ${
                      photo === 0
                        ? "aspect-[3/4] lg:aspect-[4/3]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className={`h-full w-full object-cover ${
                        photo === 0
                          ? "object-center lg:object-[center_50%]"
                          : "object-center"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div
              className={`col-span-6 mt-4 lg:mt-0 ${
                entry.covers?.length
                  ? "lg:col-span-4 lg:col-start-9 lg:flex lg:flex-col lg:justify-end"
                  : "lg:col-span-8 lg:col-start-1"
              }`}
            >
              <h2 className="text-display-m">{entry.title}</h2>
              <p className="label text-label-s mt-3 text-gray-dark-40">
                {entry.meta}
              </p>
              {entry.href && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noreferrer"
                    className="label text-label-s inline-block bg-scarlet px-5 py-3 text-white transition-opacity duration-200 hover:opacity-80"
                  >
                    {entry.cta ?? "Learn more"}
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
