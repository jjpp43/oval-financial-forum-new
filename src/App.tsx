import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Stairs from "./components/Stairs";
import ScrollReset from "./components/ScrollReset";
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
import { useLenis } from "./lib/anim";
import { useAnalytics } from "./lib/analytics";

/* =============================================================================
 * ROUTE / — the home page, six sections top to bottom.
 * Each section file carries a banner comment naming its position in this list.
 * ========================================================================== */
function Home() {
  return (
    <main>
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

/** Renders nothing — it is only here to run the hook inside the router. */
function Analytics() {
  useAnalytics();
  return null;
}

/* =============================================================================
 * APP SHELL — route table and the chrome that shows on every page.
 * Nav (fixed bar) and Footer sit outside <Routes>, so only the middle swaps.
 * ========================================================================== */
export default function App() {
  useLenis();

  return (
    <BrowserRouter>
      {/* curtain covers the viewport during load; page renders underneath so
          a GSAP failure can never leave a blank screen */}
      <Stairs />
      <Nav />
      <ScrollReset />
      <Analytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/apply" element={<Apply />} />
        {/* anything unknown falls back to the landing page */}
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
