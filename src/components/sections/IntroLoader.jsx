import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Coordinate map of the {V} pixel matrix
 * 0 = empty, 1 = white pixel, 2 = gold ember pixel
 */
const V_MATRIX = [
  // Row 0
  [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 1],
  // Row 1
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 1],
  // Row 2
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1],
  // Row 3
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1, 0],
  // Row 4 (Brace middle points)
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  // Row 5
  [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  // Row 6
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 7
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 8
  [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
];

export default function IntroLoader({ onComplete, onSettled, prefersReducedMotion }) {
  // URL phase override for deterministic visual inspection & testing
  const urlPhase = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('phase')
    : null;

  // 'assembling' -> 'assembled' (hold beat) -> 'zooming' (camera pull back 1.2s) -> 'done'
  const [phase, setPhase] = useState(() => urlPhase || 'assembling');

  // Skip immediately if reduced motion or user already scrolled down (unless testing)
  const shouldSkip = useMemo(() => {
    if (urlPhase) return false;
    if (typeof window !== 'undefined' && window.location.search.includes('intro=true')) {
      return false;
    }
    if (prefersReducedMotion) return true;
    if (typeof window !== 'undefined' && window.scrollY > 50) return true;
    return false;
  }, [prefersReducedMotion, urlPhase]);

  // Extract pixel coordinates for grid
  const pixelPoints = useMemo(() => {
    const points = [];
    const rows = V_MATRIX.length;
    const cols = V_MATRIX[0].length;
    const cellSize = 14; // pixels per cell

    V_MATRIX.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val > 0) {
          const targetX = (c - cols / 2) * cellSize;
          const targetY = (r - rows / 2) * cellSize;

          // Random scattered start position
          const angle = Math.random() * Math.PI * 2;
          const distance = 250 + Math.random() * 400;
          const startX = Math.cos(angle) * distance;
          const startY = Math.sin(angle) * distance;

          points.push({
            id: `${r}-${c}`,
            targetX,
            targetY,
            startX,
            startY,
            isGold: val === 2,
            delay: Math.random() * 0.4,
          });
        }
      });
    });
    return points;
  }, []);

  // Lock scrolling during the loader and release cleanly
  useEffect(() => {
    if (urlPhase) return;

    if (shouldSkip) {
      if (onComplete) onComplete();
      if (onSettled) onSettled();
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 1. Assembling (0.0s -> 1.1s)
    const holdTimer = setTimeout(() => {
      setPhase('assembled'); // Hold for a beat
    }, 1150);

    // 2. Hold beat (1.15s -> 1.65s) -> Begin zoom-out camera transition (1.2s duration)
    const zoomTimer = setTimeout(() => {
      setPhase('zooming');
      // Release body scroll cleanly as camera pullback begins
      document.body.style.overflow = originalOverflow;
    }, 1650);

    // 3. Zoom-out transition settles (1.65s + 1.2s = 2.85s)
    const settleTimer = setTimeout(() => {
      if (onSettled) onSettled();
    }, 2850);

    // 4. Complete and unmount loader
    const completeTimer = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2950);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(holdTimer);
      clearTimeout(zoomTimer);
      clearTimeout(settleTimer);
      clearTimeout(completeTimer);
    };
  }, [shouldSkip, onComplete, onSettled]);

  if (shouldSkip || phase === 'done') return null;

  const isMidZoom = phase === 'midzoom';
  const isZooming = phase === 'zooming' || isMidZoom;
  const isAssembledOrLater = phase === 'assembled' || isZooming;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[100] bg-vulcan-bg flex flex-col items-center justify-center overflow-hidden select-none ${
          isZooming ? 'pointer-events-none' : 'cursor-pointer'
        }`}
        initial={{ opacity: 1 }}
        animate={{
          opacity: isMidZoom ? 0.45 : isZooming ? 0 : 1,
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: isMidZoom ? 0 : 1.2,
          ease: [0.65, 0, 0.35, 1], // Smooth continuous camera ease-in-out
        }}
        onClick={() => {
          document.body.style.overflow = '';
          setPhase('done');
          if (onComplete) onComplete();
          if (onSettled) onSettled();
        }}
        title="Click to skip"
      >
        {/* Subtle radial background glow */}
        <div className="absolute w-[500px] h-[500px] bg-vulcan-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Central Logo Container with Camera Zoom Out */}
        <motion.div
          className="relative flex flex-col items-center justify-center"
          animate={{
            scale: isMidZoom ? 0.94 : isZooming ? 0.88 : 1,
            y: isMidZoom ? -6 : isZooming ? -12 : 0,
          }}
          transition={{
            duration: isMidZoom ? 0 : 1.2,
            ease: [0.65, 0, 0.35, 1], // Smooth continuous camera pullback
          }}
        >
          {/* Assembled Pixel Grid */}
          <div className="relative w-72 h-64 flex items-center justify-center">
            {pixelPoints.map((p) => (
              <motion.div
                key={p.id}
                className={`absolute rounded-[1px] ${
                  p.isGold
                    ? 'bg-vulcan-gold shadow-[0_0_8px_rgba(245,166,35,0.8)] z-10'
                    : 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.4)]'
                }`}
                style={{
                  width: 10,
                  height: 10,
                }}
                initial={{
                  x: p.startX,
                  y: p.startY,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  x: p.targetX,
                  y: p.targetY,
                  opacity: isMidZoom ? 0.7 : isZooming ? 0 : 1,
                  scale: isAssembledOrLater && p.isGold ? [1, 1.25, 1] : 1,
                }}
                transition={{
                  x: {
                    duration: 0.95,
                    delay: p.delay,
                    ease: [0.23, 1, 0.32, 1],
                  },
                  y: {
                    duration: 0.95,
                    delay: p.delay,
                    ease: [0.23, 1, 0.32, 1],
                  },
                  opacity: {
                    duration: isZooming ? 0.8 : 0.4,
                    delay: isZooming ? 0.2 : p.delay,
                  },
                  scale: { duration: 0.4, delay: isAssembledOrLater ? 0.05 : p.delay },
                }}
              />
            ))}
          </div>

          {/* Wordmark Reveal under Logo (fades out first during zoom) */}
          <motion.div
            className="mt-6 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isZooming ? 0 : isAssembledOrLater ? 1 : 0,
              y: isZooming ? -5 : isAssembledOrLater ? 0 : 10,
            }}
            transition={{
              duration: isZooming ? 0.35 : 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <span className="font-sans font-bold text-xl tracking-tight text-white lowercase">
              vulcan club
            </span>
            <span className="font-mono text-[11px] text-vulcan-textMuted tracking-wider uppercase">
              assembling system
            </span>
          </motion.div>
        </motion.div>

        {/* Skip hint */}
        <motion.div
          className="absolute bottom-6 font-mono text-[10px] text-vulcan-textFaint tracking-widest uppercase"
          animate={{ opacity: isZooming ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          [click or press any key to enter]
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
