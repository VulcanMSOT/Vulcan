import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { ENROLLMENT_COPY } from '../../config/enrollment';

export default function IntroScene({
  onBegin,
}) {
  // Allow pressing Enter to quickly start forging
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.target.matches('input, textarea, button')) {
        onBegin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBegin]);

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col justify-between select-none">
      {/* 1. Pinned Top Nav Bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 py-4 sm:py-5 flex items-center justify-between pointer-events-auto bg-[#050506]/75 backdrop-blur-md border-b border-zinc-800/50"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/vulcan-logo.png"
            alt="Vulcan emblem"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
          <span className="font-sans font-extrabold text-base sm:text-lg tracking-tight text-white lowercase">
            vulcan club
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-zinc-950/80 backdrop-blur-md shadow-[0_0_15px_rgba(245,166,35,0.12)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] sm:text-xs text-amber-300 tracking-tight font-semibold">
            2026 INTAKE OPEN
          </span>
        </div>
      </motion.header>

      {/* 2. Main Content Viewport */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-20 sm:pb-24 min-h-screen flex flex-col justify-center">
        {/* Responsive Layout Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Mobile-only spacer for 3D Emblem (keeps top 35vh dedicated to 3D scene) */}
          <div className="lg:hidden w-full h-[32vh] min-h-[190px] max-h-[260px] pointer-events-none" aria-hidden="true" />

          {/* Left Column: Text & CTA with dark gradient scrim for maximum readability */}
          <div className="lg:col-span-7 xl:col-span-6 text-center lg:text-left z-20">
            <div className="relative lg:p-6 lg:-ml-6 rounded-3xl lg:bg-gradient-to-r lg:from-[#050506]/95 lg:via-[#050506]/85 lg:to-transparent lg:backdrop-blur-[2px]">
              
              {/* Category Pill */}
              <motion.div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/80 backdrop-blur-md mb-4 sm:mb-5 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 font-medium">
                  {ENROLLMENT_COPY.badge}
                </span>
              </motion.div>

              {/* Main Headline with Thin Vertical Orange Line Accent beside it */}
              <motion.div
                className="flex items-stretch gap-3.5 sm:gap-4.5 mb-4 sm:mb-5 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Thin vertical orange line accent */}
                <div
                  className="w-[3px] rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-red-600/30 shrink-0 hidden sm:block shadow-[0_0_8px_rgba(245,166,35,0.4)]"
                  aria-hidden="true"
                />

                <h1 className="font-sans font-black text-2xl sm:text-4xl md:text-5xl xl:text-6xl text-white tracking-tight leading-[1.12]">
                  Welcome to Vulcan Club{' '}
                  <span className="block sm:inline bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,166,35,0.35)]">
                    Enrollment 2026
                  </span>
                </h1>
              </motion.div>

              {/* High Contrast Body Copy (WCAG AA #D4D4D8, max-width ~52ch) */}
              <motion.p
                className="font-sans text-sm sm:text-base md:text-lg text-[#D4D4D8] max-w-[52ch] mx-auto lg:mx-0 leading-relaxed mb-6 sm:mb-8 font-normal"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
              >
                {ENROLLMENT_COPY.welcomeNote}
              </motion.p>

              {/* CTA Button & Keyboard Action */}
              <motion.div
                className="flex flex-col items-center lg:items-start gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <button
                  type="button"
                  onClick={onBegin}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-black font-sans font-extrabold text-sm sm:text-base tracking-wide shadow-[0_0_30px_rgba(245,166,35,0.4)] hover:shadow-[0_0_45px_rgba(245,166,35,0.65)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/40 pointer-events-none" />
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  <span>{ENROLLMENT_COPY.ctaBegin}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                {/* Keyboard Enter Hint */}
                <span className="font-mono text-[11px] text-zinc-400 tracking-wider flex items-center gap-1.5 pt-1">
                  <span>PRESS</span>
                  <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 font-mono text-[10px]">
                    ENTER ↵
                  </kbd>
                  <span>TO ENTER THE FORGE</span>
                </span>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Dedicated 3D Emblem Viewport on Desktop (45-50% width) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 h-[460px] items-center justify-center pointer-events-none" aria-hidden="true" />

        </div>
      </div>

      {/* 3. Pinned Fixed Bottom Footer Bar */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 py-3.5 flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 bg-[#050506]/85 backdrop-blur-md border-t border-zinc-800/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span>MIRAI SCHOOL OF TECHNOLOGY</span>
        <span>FIRST PRINCIPLES ENGINEERING</span>
      </motion.footer>
    </div>
  );
}
