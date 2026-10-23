import { useState } from 'react';
import { useLenis } from './hooks/useLenis';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import ScrollProgress from './components/ui/ScrollProgress';
import CustomCursor from './components/ui/CustomCursor';
import IntroLoader from './components/sections/IntroLoader';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import WhatWeDo from './components/sections/WhatWeDo';
import Events from './components/sections/Events';
import Projects from './components/sections/Projects';
import Team from './components/sections/Team';
import Closing from './components/sections/Closing';
import Footer from './components/sections/Footer';

export default function App() {
  const [loaderComplete, setLoaderComplete] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger
  useLenis();

  return (
    <div className="relative min-h-screen bg-vulcan-bg text-white selection:bg-vulcan-gold/20 selection:text-vulcan-gold">
      {/* Top Scroll Indicator */}
      <ScrollProgress />

      {/* Spring-damped Custom Cursor (desktop only) */}
      <CustomCursor />

      {/* 1. Intro Pixel Loader */}
      {!loaderComplete && (
        <IntroLoader
          onComplete={() => setLoaderComplete(true)}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Main Landing Flow */}
      <main className="relative w-full overflow-hidden">
        {/* 2. Hero */}
        <Hero prefersReducedMotion={prefersReducedMotion} />

        {/* 3. About */}
        <About prefersReducedMotion={prefersReducedMotion} />

        {/* 4. What we do */}
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
        <Footer />
      </main>
    </div>
  );
}
