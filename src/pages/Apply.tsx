import { useEffect, useRef } from "react";
import gsap from "gsap";
import PageHead from "../components/PageHead";
import { apply, studio } from "../content";
import { splitChars } from "../lib/anim";
import { track } from "../lib/analytics";

/* =============================================================================
 * ROUTE /apply — "Join Us" in the nav
 * Masthead, then one 12-col band: who we look for on the left (note + Apply
 * button), a vertical timeline on the right. Copy: `apply` in content.ts.
 * ========================================================================== */
export default function Apply() {
  const timeline = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = timeline.current;
    if (!el) return;
    const heading = el.querySelector<HTMLElement>(".timeline-title");
    const track = el.querySelector<HTMLElement>(".timeline-track");
    const list = el.querySelector<HTMLElement>("ol");
    if (!heading || !track || !list) return;

    const layout = () => {
      const nodes = list.querySelectorAll<HTMLElement>(".timeline-node");
      if (nodes.length < 2) {
        track.style.height = "0px";
        return;
      }
      const box = list.getBoundingClientRect();
      const first = nodes[0].getBoundingClientRect();
      const last = nodes[nodes.length - 1].getBoundingClientRect();
      const top = first.top + first.height / 2 - box.top;
      const bottom = last.top + last.height / 2 - box.top;
      track.style.top = `${top}px`;
      track.style.height = `${Math.max(0, bottom - top)}px`;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(list);

    const chars = splitChars(heading);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.style.transform = "scaleY(1)";
      return () => ro.disconnect();
    }

    const reveal = gsap.fromTo(
      chars,
      { yPercent: 100, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.018,
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      },
    );

    const draw = gsap.fromTo(
      track,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 0.9,
        ease: "power3.out",
        transformOrigin: "50% 0%",
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      },
    );

    return () => {
      reveal.scrollTrigger?.kill();
      reveal.kill();
      draw.scrollTrigger?.kill();
      draw.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <main>
      <PageHead
        eyebrow={apply.eyebrow}
        headline={apply.headline}
        intro={apply.intro}
        bg="/img/joinusBanner.jpg"
      />

      <section
        ref={timeline}
        id="recruitment"
        className="grid-page px-6 py-24 lg:px-15 lg:pt-32 lg:pb-32"
      >
        <div className="col-span-6">
          {apply.points.map((p) => (
            <div key={p.title}>
              <h2 className="timeline-title text-heading">{p.title}</h2>
              <p className="label text-label-s mt-4 leading-relaxed text-gray-dark-40">
                {p.body.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
              {p.note && (
                <p className="text-body-s mt-4 font-semibold leading-relaxed text-scarlet">
                  {p.note}
                </p>
              )}
            </div>
          ))}
          <a
            href={apply.formUrl || `mailto:${studio.email}`}
            {...(apply.formUrl
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            onClick={() => track("apply_clicked", { where: "page" })}
            className="label text-label-s mt-8 block w-full bg-scarlet px-5 py-4 text-center text-white transition-opacity duration-200 hover:opacity-80 lg:inline-block lg:w-auto"
          >
            {apply.cta}
          </a>
        </div>

        <ol
          aria-label={apply.timeline.headline}
          className="relative col-span-6 mt-20 lg:col-span-6 lg:col-start-7 lg:mt-0"
        >
          <div
            aria-hidden
            className="timeline-track absolute left-[7px] w-[2px] origin-top bg-gray"
          />

          {apply.timeline.events.map((e, i) => {
            const last = i === apply.timeline.events.length - 1;
            return (
              <li
                key={e.at}
                className={`relative flex gap-x-5 ${last ? "" : "pb-12 lg:pb-14"}`}
              >
                <span
                  aria-hidden
                  className="timeline-node relative z-10 mt-[calc(1.875rem*1.15/2-8px)] size-4 shrink-0 rounded-full border-2 border-scarlet bg-gray-light-90"
                />
                <div>
                  <p className="text-heading font-semibold">{e.title}</p>
                  <time
                    dateTime={e.at}
                    className="label text-label-s mt-2 block text-gray-dark-40"
                  >
                    {e.month} {e.day} · {e.time}
                  </time>
                  <p className="label text-label-s mt-2 flex items-center gap-1.5 text-gray-dark-40">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 shrink-0"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.25"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {e.location}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
