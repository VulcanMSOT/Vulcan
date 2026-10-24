import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import HeroCanvas from '../3d/HeroCanvas';
import { CLUB_INFO } from '../../content';

export default function Hero({
  prefersReducedMotion,
  introSettled = true,
  isTransitioning = false,
  heroCanvasVisible = true,
}) {
  const scrollToWork = () => {
    const target = document.getElementById('about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 pt-8 pb-12 overflow-hidden bg-vulcan-bg select-none"
    >
      {/* Background radial gradient spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-vulcan-gold/[0.04] via-transparent to-transparent pointer-events-none rounded-full blur-3xl"
        aria-hidden="true"
      />

      {/* Top Bar: Wordmark + Subtle Status */}
      <motion.header
        className="w-full max-w-6xl mx-auto flex items-center justify-between z-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{
          opacity: introSettled ? 1 : 0,
          y: introSettled ? 0 : -12,
        }}
        transition={{
          duration: 0.35,
          ease: [0.23, 1, 0.32, 1],
          delay: prefersReducedMotion ? 0 : 0.05,
        }}
        style={{
          visibility: introSettled ? 'visible' : 'hidden',
          pointerEvents: introSettled ? 'auto' : 'none',
        }}
        inert={!introSettled ? '' : undefined}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/vulcan-logo.png"
            alt="Vulcan emblem"
            className="w-7 h-7 object-contain opacity-90"
          />
          <span className="font-sans font-bold text-lg tracking-tight text-white lowercase">
            {CLUB_INFO.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/halloween-hack"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vulcan-gold text-vulcan-bg text-xs font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vulcan-gold"
          >
            Hack-O-Lantern
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-vulcan-border/70 bg-vulcan-card/60 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold animate-pulse" />
            <span className="font-mono text-xs text-vulcan-textMuted tracking-tight">
              closed intake
            </span>
          </div>
        </div>
      </motion.header>

      {/* Center 3D Showcase with smooth full-screen zoom-out */}
      <motion.div
        id="hero-canvas-container"
        className={`relative w-full max-w-4xl h-[52vh] sm:h-[58vh] md:h-[64vh] my-auto flex items-center justify-center z-10 ${
          heroCanvasVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{
          opacity: 0,
          scale: 1.4,
        }}
        animate={{
          opacity: heroCanvasVisible ? 1 : 0,
          scale: introSettled ? 1 : isTransitioning ? [1.4, 1] : 1.4,
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: isTransitioning ? 0.12 : 0,
            ease: 'easeOut',
          },
          scale: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1], // Smooth physical deceleration curve
          },
        }}
        style={{
          visibility: heroCanvasVisible ? 'visible' : 'hidden',
        }}
      >
        <HeroCanvas prefersReducedMotion={prefersReducedMotion} />
      </motion.div>

      {/* Bottom Hero Narrative: Tagline & Explore Button */}
      <motion.div
        className="w-full max-w-3xl mx-auto flex flex-col items-center text-center z-10 gap-5"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: introSettled ? 1 : 0,
          scale: introSettled ? 1 : 0.96,
        }}
        transition={{
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1],
          delay: prefersReducedMotion ? 0 : 0.15,
        }}
        style={{
          visibility: introSettled ? 'visible' : 'hidden',
          pointerEvents: introSettled ? 'auto' : 'none',
        }}
        inert={!introSettled ? '' : undefined}
      >
        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.22em] text-white uppercase">
            Vulcan
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-normal tracking-tight text-zinc-400 max-w-xl mx-auto">
            {CLUB_INFO.tagline}
          </p>
        </div>

        {/* Scroll Action Button */}
        <button
          onClick={scrollToWork}
          className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-vulcan-border bg-vulcan-card/80 hover:bg-vulcan-surface hover:border-vulcan-gold/40 text-sm font-medium text-zinc-200 transition-all duration-200"
          aria-label="Scroll to club activities"
        >
          <span>Explore our work</span>
          <ArrowDown className="w-4 h-4 text-vulcan-gold group-hover:translate-y-0.5 transition-transform duration-200" />
        </button>
      </motion.div>

      {/* Subtle Bottom Grid Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vulcan-border to-transparent opacity-60" />
    </section>
  );
}
