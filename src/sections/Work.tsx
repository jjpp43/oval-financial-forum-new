import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { issues as fallback, work } from "../content";
import { splitChars } from "../lib/anim";
import { useIssues } from "../lib/sanity";
import { track } from "../lib/analytics";

/* =============================================================================
 * HOME · section 5 of 6 — WORK / "Monthly Newsletter"
 * Row of issue cards. Published issues show a duotone cover; unpublished ones
 * show a dotted plate whose label cycles between "Coming up soon!" and the
 * month it is due. Copy: `work` in content.ts — an item with `soon` is
 * unpublished, and the value is the month shown.
 * ========================================================================== */
function Card({
  href,
  issue,
  children,
}: {
  href?: string;
  /** volume of the edition this card links to, for the read event */
  issue?: number;
  children: ReactNode;
}) {
  const cls = "work-item flex flex-col";
  // the issue opens in a new tab, so the event has time to leave before the
  // browser moves on — no need for sendBeacon or a delayed navigation
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${cls} group`}
      onClick={() => track("issue_read", { volume: issue, from: "home" })}
    >
      {children}
    </a>
  ) : (
    <article className={cls}>{children}</article>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const issues = useIssues(fallback);
  // the row is the tail of the archive — the newest four editions, oldest of
  // them first, so the placeholder plate stays on the right
  const shown = issues.slice(-4);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const heading = el.querySelector<HTMLElement>(".work-title");
    if (!heading) return;

    const chars = splitChars(heading);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

    return () => {
      reveal.scrollTrigger?.kill();
      reveal.kill();
    };
  }, []);

  // the card tweens are separate because the CMS list arrives after mount and
  // adds or removes plates — they rebuild against the new nodes, while the
  // heading above keeps its one-shot reveal instead of replaying it
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // cards slide up from below and fade in, one after the other
    const plates = gsap.fromTo(
      el.querySelectorAll(".work-item"),
      { y: 90, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        // scrubbed: the grid arrives as you scroll through it, and the
        // stagger becomes a slice of the scroll range instead of seconds
        scrollTrigger: {
          trigger: el.querySelector(".work-grid"),
          start: "top 90%",
          end: "top 35%",
          scrub: 0.5,
        },
      },
    );

    // unpublished plates trade their label back and forth with the month the
    // issue is due. Offset per card so the three never scramble in unison.
    const soon = Array.from(
      el.querySelectorAll<HTMLElement>(".soon-label"),
    ).map((label, i) => {
      const month = label.dataset.month ?? "";
      const scramble = { chars: "upperCase", speed: 0.5 } as const;

      return gsap
        .timeline({
          repeat: -1,
          repeatDelay: 2.4,
          delay: i * 0.8,
          scrollTrigger: {
            trigger: el.querySelector(".work-grid"),
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        })
        .to(label, {
          duration: 0.7,
          ease: "none",
          scrambleText: { text: month, ...scramble },
        })
        .to(label, {
          duration: 0.7,
          ease: "none",
          scrambleText: { text: work.soonLabel, ...scramble },
          delay: 2,
        });
    });

    return () => {
      plates.scrollTrigger?.kill();
      plates.kill();
      soon.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [issues]);

  return (
    <section
      ref={root}
      id="work"
      className="px-6 pt-24 pb-32 lg:px-15 lg:pt-32 lg:pb-48"
    >
      <h2 className="work-title text-display-l mx-auto font-semibold max-w-[12ch] text-center">
        {work.headline}
      </h2>

      {/* ---- the issue row ------------------------------------------------
          one flat row — no stagger. The client name reserves two lines so the
          plates below it start at the same height whether the name wraps. */}
      <div
        className={`work-grid mx-auto mt-20 grid grid-cols-2 items-start gap-x-6 gap-y-16 md:gap-x-15 lg:mt-32 ${
          // one column per issue, up to the full four-wide row; a short row
          // stays centred at the width it would have had inside a full one
          {
            1: "lg:max-w-1/4 lg:grid-cols-1",
            2: "lg:max-w-1/2 lg:grid-cols-2",
            3: "lg:max-w-3/4 lg:grid-cols-3",
            4: "lg:grid-cols-4",
          }[Math.min(shown.length, 4)]
        }`}
      >
        {shown.map((issue, i) => (
          // a published issue makes the whole card its own link to the issue;
          // an unpublished one has nowhere to go, so it stays a plain div
          <Card
            key={issue.volume}
            href={issue.html ?? undefined}
            issue={issue.volume}
          >
            <div className="flex items-baseline justify-between border-b border-scarlet/25 pb-2">
              <span className="label text-label-s text-gray-dark-40"></span>
              <span className="label text-label-s text-gray-dark-40">
                Vol.{issue.volume}
              </span>
            </div>

            <h3 className="text-heading mt-7 min-h-[2lh]">{issue.title}</h3>

            {/* unpublished issues keep the plate, lose the picture */}
            {!issue.published ? (
              <div className="dot-grid grid aspect-4/5 place-items-center border border-scarlet/25">
                <span
                  className="soon-label label text-label-s text-gray-dark-40"
                  data-month={issue.due}
                >
                  {work.soonLabel}
                </span>
              </div>
            ) : (
              <div className="relative aspect-4/5 overflow-hidden">
                <img
                  src={issue.cover ?? `/img/p${(i % 5) + 1}.jpg`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {/* the card itself is the link — this is the affordance, not a
                    second control, so it stays a span and out of the a11y tree */}
                {issue.html && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 grid aspect-square w-12 place-items-center border-1 border-gray-dark-10 bg-white text-scarlet transition-[width] duration-200 group-hover:w-16"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M7 17L17 7M17 7H8M17 7v9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ---- CTA under the row (leftover agency copy — points nowhere) ---- */}
      <a
        href="/archive"
        className="label text-label-s mx-auto mt-20 block max-w-sm bg-scarlet py-4 text-center text-white transition-opacity duration-200 hover:opacity-90 lg:mt-28"
      >
        View more
      </a>
    </section>
  );
}
