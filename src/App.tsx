import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Stairs from "./components/Stairs";
import { useShownLocation } from "./components/ScrollReset";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Services from "./sections/Services";
import Approach from "./sections/Approach";
import Work from "./sections/Work";
import Team from "./sections/Team";
import Footer from "./sections/Footer";
import Archive from "./pages/Archive";
import TeamPage from "./pages/TeamPage";
import Apply from "./pages/Apply";
import Seo from "./components/Seo";
import ScrollSpine from "./components/ScrollSpine";
import { useLenis } from "./lib/anim";
import { useAnalytics } from "./lib/analytics";

/* =============================================================================
 * ROUTE / — the home page, six sections top to bottom.
 * Each section file carries a banner comment naming its position in this list.
 * ========================================================================== */
function Home() {
  return (
    <main>
      <ScrollSpine />
      {/* section order mirrors the donor: dithered hero, blue statement
          second, then services / approach / work / team */}
      <Hero />
      <Intro />
      <Services />
      <Approach />
      <Work />
      <Team />
    </main>
  );
}

function Shell() {
  useAnalytics();
  const shown = useShownLocation();

  return (
    <>
      {/* curtain covers the viewport during load and each in-app route;
          the page renders underneath so a GSAP failure can never leave
          a blank screen */}
      <Stairs />
      <Nav />
      <Seo />
      <Routes location={shown}>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/apply" element={<Apply />} />
        {/* unknown paths redirect so they are not indexed as a second home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

/* =============================================================================
 * APP SHELL — route table and the chrome that shows on every page.
 * Nav (fixed bar) and Footer sit outside <Routes>, so only the middle swaps.
 * ========================================================================== */
export default function App() {
  useLenis();

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
