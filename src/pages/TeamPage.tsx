import PageHead from "../components/PageHead";
import Team from "../sections/Team";
import { studio, team } from "../content";

/* =============================================================================
 * ROUTE /team — the full roster
 * Masthead (wall banner) then the shared Team grid in its `bare` variant:
 * 5 columns, large portraits, a bio strip that opens under the clicked row.
 * ========================================================================== */
export default function TeamPage() {
  return (
    <main>
      <PageHead
        eyebrow={team.eyebrow}
        headline={team.headline}
        intro={studio.tagline}
        bg="/img/teamBanner.jpg"
      />

      {/* same grid as the home page, without its own heading block. The apply
          invitation rides in the grid's last empty cell, so there is no
          separate CTA band under it. */}
      <Team bare />
    </main>
  );
}
