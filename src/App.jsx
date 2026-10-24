import { useState, useEffect } from 'react';
import { useLenis } from './hooks/useLenis';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import ScrollProgress from './components/ui/ScrollProgress';
import SectionIndicator from './components/ui/SectionIndicator';
import CustomCursor from './components/ui/CustomCursor';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import HackOLanternTeaser from './components/sections/HackOLanternTeaser';
import WhatWeDo from './components/sections/WhatWeDo';
import Events from './components/sections/Events';
import Projects from './components/sections/Projects';
import Team from './components/sections/Team';
import Closing from './components/sections/Closing';
import Footer from './components/sections/Footer';

export default function App() {
  const urlPhase = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('phase')
    : null;

  const [introSettled, setIntroSettled] = useState(() => urlPhase === 'done');
  const prefersReducedMotion = usePrefersReducedMotion();

  // Prevent browser scroll restoration jump on refresh
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (
      typeof window !== 'undefined' &&
      window.scrollY > 50 &&
      !window.location.search.includes('intro=true')
    ) {
      setIntroSettled(true);
    }
  }, []);

  // Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger once intro settles
  useLenis(introSettled);

  return (
    <div className="relative min-h-screen bg-vulcan-bg text-white selection:bg-vulcan-gold/20 selection:text-vulcan-gold">
      {/* Top Scroll Indicator */}
      <ScrollProgress />

      {/* Side Section Indicator */}
      <SectionIndicator prefersReducedMotion={prefersReducedMotion} />

      {/* Spring-damped Custom Cursor (desktop only) */}
      <CustomCursor />

      {/* Main Landing Flow */}
      <main className="relative w-full overflow-hidden">
        {/* 1. Hero with integrated persistent 3D loader and camera zoom-out */}
        <Hero
          prefersReducedMotion={prefersReducedMotion}
          introSettled={introSettled}
          onSettled={() => setIntroSettled(true)}
        />

        {/* 3. About */}
        <About prefersReducedMotion={prefersReducedMotion} />

        {/* 4. Hack-O-Lantern Teaser Section */}
        <HackOLanternTeaser prefersReducedMotion={prefersReducedMotion} />

        {/* 5. What we do */}
        <WhatWeDo prefersReducedMotion={prefersReducedMotion} />

        {/* 5. Events */}
        <Events prefersReducedMotion={prefersReducedMotion} />

        {/* 6. Projects */}
        <Projects prefersReducedMotion={prefersReducedMotion} />

        {/* 7. Team */}
        <Team prefersReducedMotion={prefersReducedMotion} />

        {/* 8. Closing section */}
        <Closing prefersReducedMotion={prefersReducedMotion} />

        {/* 9. Footer */}
        <Footer prefersReducedMotion={prefersReducedMotion} />
      </main>
    </div>
  );
}
