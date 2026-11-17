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
            href="/enroll"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-vulcan-gold/60 bg-vulcan-gold/15 hover:bg-vulcan-gold/25 text-vulcan-gold text-xs font-mono font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(245,166,35,0.3)] group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vulcan-gold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span>Intake 2026 Open</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="/halloween-hack"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-vulcan-border/70 bg-vulcan-card/60 backdrop-blur-md text-zinc-300 hover:text-white hover:border-vulcan-border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vulcan-gold"
          >
            Hack-O-Lantern
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
          </a>
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
        }}
        animate={{
          opacity: heroCanvasVisible ? 1 : 0,
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: isTransitioning ? 0.12 : 0,
            ease: 'easeOut',
          },
        }}
        style={{
          visibility: heroCanvasVisible ? 'visible' : 'hidden',
        }}
      >
        <HeroCanvas
          prefersReducedMotion={prefersReducedMotion}
          introSettled={introSettled}
          isTransitioning={isTransitioning}
        />
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

        {/* Action Buttons: Primary Enrollment CTA + Secondary Explore */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <a
            href="/enroll"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-black font-sans font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(245,166,35,0.35)] hover:shadow-[0_0_35px_rgba(245,166,35,0.55)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Enter the Forge • 2026 Intake</span>
            <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" aria-hidden="true" />
          </a>

          <button
            onClick={scrollToWork}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-vulcan-border bg-vulcan-card/80 hover:bg-vulcan-surface hover:border-vulcan-gold/40 text-sm font-medium text-zinc-200 transition-all duration-200 cursor-pointer"
            aria-label="Scroll to club activities"
          >
            <span>Explore our work</span>
            <ArrowDown className="w-4 h-4 text-vulcan-gold group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </motion.div>

      {/* Subtle Bottom Grid Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vulcan-border to-transparent opacity-60" />
    </section>
  );
}
