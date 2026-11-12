import React from 'react';
import { motion } from 'framer-motion';

export default function QuietEmberBackground({
  sceneState = 'intro',
  prefersReducedMotion = false,
  isMobile = false,
}) {
  const isIntro = sceneState === 'intro';

  // Sizing and position for the single soft radial glow centered behind the logo
  // Desktop Intro: right ~72%, vertically centered ~50%
  // Mobile Intro: center ~50%, top ~24%
  // Form Scene: center ~50%, top ~16%
  let glowLeft = '72%';
  let glowTop = '50%';

  if (isMobile) {
    glowLeft = '50%';
    glowTop = isIntro ? '24%' : '18%';
  } else if (!isIntro) {
    glowLeft = '50%';
    glowTop = '16%';
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base solid #050505 background with subtle edge vignette (~20% darker edges) */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)] opacity-80" />

      {/* 2. Thin warm horizon glow along the bottom 20% of the screen (#9A3412 at 18% opacity fading to transparent) */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-[rgba(154,52,18,0.18)] via-[rgba(154,52,18,0.05)] to-transparent" />

      {/* 3. Hairline grid detail: 3-4% opacity, radially masked around the 3D logo */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #9A3412 1px, transparent 1px), linear-gradient(to bottom, #9A3412 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: `radial-gradient(circle at ${glowLeft} ${glowTop}, black 0%, transparent 55%)`,
          WebkitMaskImage: `radial-gradient(circle at ${glowLeft} ${glowTop}, black 0%, transparent 55%)`,
        }}
      />

      {/* 4. Large soft radial glow (#9A3412 to transparent, ~30% opacity, sized ~1.2x the logo) */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: glowLeft,
          top: glowTop,
          width: isMobile ? '320px' : '440px',
          height: isMobile ? '320px' : '440px',
          background:
            'radial-gradient(circle, rgba(154, 52, 18, 0.30) 0%, rgba(154, 52, 18, 0.10) 45%, transparent 75%)',
        }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.28 }
            : { opacity: [0.22, 0.32, 0.22] }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 5. Light film grain texture overlay (~4% opacity) to eliminate banding */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none">
        <filter id="quietEmberGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#quietEmberGrain)" />
      </svg>
    </div>
  );
}
