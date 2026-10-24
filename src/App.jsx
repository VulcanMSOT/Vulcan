import { useState, useEffect } from 'react';
import { useLenis } from './hooks/useLenis';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import ScrollProgress from './components/ui/ScrollProgress';
import SectionIndicator from './components/ui/SectionIndicator';
import CustomCursor from './components/ui/CustomCursor';
import IntroLoader from './components/sections/IntroLoader';
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

  // Single authoritative state machine: 'loading' | 'transitioning' | 'done'
  const [introPhase, setIntroPhase] = useState(() => (urlPhase === 'done' ? 'done' : 'loading'));
  const prefersReducedMotion = usePrefersReducedMotion();

  // Derived state flags
  const isTransitioning = introPhase === 'transitioning';
  const introSettled = introPhase === 'done';
  const heroCanvasVisible = introPhase === 'transitioning' || introPhase === 'done';
  const loaderComplete = introPhase === 'done';

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
      setIntroPhase('done');
    }
  }, []);

  // Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger (enabled after intro settles)
  useLenis(introSettled);

  return (
    <div className="relative min-h-screen bg-vulcan-bg text-white selection:bg-vulcan-gold/20 selection:text-vulcan-gold">
      {/* Top Scroll Indicator */}
      <ScrollProgress />

      {/* Side Section Indicator */}
      <SectionIndicator
        prefersReducedMotion={prefersReducedMotion}
        introSettled={introSettled}
      />

      {/* Spring-damped Custom Cursor (desktop only) */}
      <CustomCursor />

      {/* 1. Intro Pixel Loader with continuous full-screen zoom-out & slow dissolve */}
      {!loaderComplete && (
        <IntroLoader
          onTransitionStart={() => setIntroPhase('transitioning')}
          onComplete={() => setIntroPhase('done')}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Main Landing Flow */}
      <main className="relative w-full overflow-hidden">
        {/* 2. Hero */}
        <Hero
          prefersReducedMotion={prefersReducedMotion}
          introSettled={introSettled}
          isTransitioning={isTransitioning}
          heroCanvasVisible={heroCanvasVisible}
        />

        {/* 3. About */}
        <About prefersReducedMotion={prefersReducedMotion} />

        {/* Below-the-fold heavy sections mount once intro settles to preserve 60fps frame budget */}
        {introSettled && (
          <>
            {/* 4. Hack-O-Lantern Teaser Section */}
            <HackOLanternTeaser prefersReducedMotion={prefersReducedMotion} />

            {/* 5. What we do */}
            <WhatWeDo prefersReducedMotion={prefersReducedMotion} />

            {/* 6. Events */}
            <Events prefersReducedMotion={prefersReducedMotion} />

            {/* 7. Projects */}
            <Projects prefersReducedMotion={prefersReducedMotion} />

            {/* 8. Team */}
            <Team prefersReducedMotion={prefersReducedMotion} />

            {/* 9. Closing section */}
            <Closing prefersReducedMotion={prefersReducedMotion} />

            {/* 10. Footer */}
            <Footer prefersReducedMotion={prefersReducedMotion} />
          </>
        )}
      </main>
    </div>
  );
}
