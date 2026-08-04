import PageHead from "../components/PageHead";
import { apply, studio } from "../content";

/* =============================================================================
 * ROUTE /apply — "Join Us" in the nav
 * Masthead (skyline banner), three "what we look for" points, then the Google
 * Form embed. Copy: `apply` in content.ts — set `apply.formUrl` to swap the
 * placeholder panel for the real form.
 * ========================================================================== */
export default function Apply() {
  return (
    <main>
      <PageHead
        eyebrow={apply.eyebrow}
        headline={apply.headline}
        intro={apply.intro}
        bg="/img/joinusBanner.jpg"
      />

      <section className="grid-page px-6 pt-24 pb-24 lg:px-15 lg:pt-32">
        {apply.points.map((p) => (
          <div
            key={p.title}
            className="col-span-6 mt-12 border-t border-scarlet/25 pt-6 first:mt-0 lg:col-span-4 lg:mt-0"
          >
            <h2 className="text-heading">{p.title}</h2>
            <p className="label text-label-s mt-4 leading-relaxed text-gray-dark-40">
              {p.body}
            </p>
          </div>
        ))}
      </section>

      <section className="px-6 pb-32 lg:px-15 lg:pb-48">
        {apply.formUrl ? (
          /* Google's embed ships its own type and spacing — the frame is the
             one place on this site the design system does not reach. */
          <iframe
            src={apply.formUrl}
            title="Membership application"
            className="h-[1200px] w-full border border-scarlet/25 bg-white"
            loading="lazy"
          />
        ) : (
          <div className="border border-scarlet/25 px-6 py-16 text-center">
            <p className="label text-label-s text-gray-dark-40">
              The application form is not open yet.
            </p>
            <a
              href={`mailto:${studio.email}`}
              className="label text-label-s mt-6 inline-block bg-scarlet px-5 py-4 text-white transition-opacity duration-200 hover:opacity-80"
            >
              Email us instead
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
