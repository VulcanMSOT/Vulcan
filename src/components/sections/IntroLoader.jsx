import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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

export default function IntroLoader({
  onTransitionStart,
  onComplete,
  onSettled,
  onCrossfadeStart,
  prefersReducedMotion,
}) {
  // URL phase override for deterministic visual inspection & testing
  const urlPhase = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('phase')
    : null;

  // Strict state machine: 'assembling' -> 'assembled' -> 'transitioning' -> 'done'
  const [phase, setPhase] = useState(() => urlPhase || 'assembling');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Cache callbacks to prevent re-render timer invalidation
  const callbacksRef = useRef({
    onTransitionStart: onTransitionStart || onCrossfadeStart,
    onComplete: onComplete || onSettled,
  });
  callbacksRef.current = {
    onTransitionStart: onTransitionStart || onCrossfadeStart,
    onComplete: onComplete || onSettled,
  };

  const startedRef = useRef(false);
  const originalOverflowRef = useRef('');

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

  // Initiate the full-screen zoom-out & slow dissolve (800ms)
  const triggerTransition = useCallback(() => {
    if (phaseRef.current === 'transitioning' || phaseRef.current === 'done') return;
    phaseRef.current = 'transitioning';
    setPhase('transitioning');

    if (callbacksRef.current.onTransitionStart) {
      callbacksRef.current.onTransitionStart();
    }

    // Complete after 800ms smooth dissolve
    setTimeout(() => {
      document.body.style.overflow = originalOverflowRef.current || '';
      phaseRef.current = 'done';
      setPhase('done');
      if (callbacksRef.current.onComplete) {
        callbacksRef.current.onComplete();
      }
    }, 800);
  }, []);

  // Sequence timers
  useEffect(() => {
    if (urlPhase === 'done' || shouldSkip) {
      document.body.style.overflow = '';
      if (callbacksRef.current.onComplete) {
        callbacksRef.current.onComplete();
      }
      return;
    }
    if (urlPhase === 'assembled' || urlPhase === 'transitioning') {
      return;
    }

    originalOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 1. Assembling (0.0s -> 1.15s)
    const holdTimer = setTimeout(() => {
      if (phaseRef.current === 'assembling') {
        phaseRef.current = 'assembled';
        setPhase('assembled');
      }
    }, 1150);

    // 2. Hold beat (1.15s -> 1.55s) -> Begin full-screen zoom-out & dissolve
    const autoTransitionTimer = setTimeout(() => {
      if (phaseRef.current === 'assembled') {
        triggerTransition();
      }
    }, 1550);

    // Keyboard trigger ("press any key to enter")
    const handleKeyDown = (e) => {
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      triggerTransition();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflowRef.current || '';
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(holdTimer);
      clearTimeout(autoTransitionTimer);
    };
  }, [shouldSkip, urlPhase, triggerTransition]);

  if (shouldSkip || phase === 'done') return null;

  const isTransitioning = phase === 'transitioning';
  const isAssembledOrLater = phase === 'assembled' || isTransitioning;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[100] bg-vulcan-bg flex flex-col items-center justify-center overflow-hidden select-none ${
          isTransitioning ? 'pointer-events-none' : 'cursor-pointer'
        }`}
        initial={{ opacity: 1 }}
        animate={{
          opacity: isTransitioning ? 0 : 1,
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1], // Smooth physical deceleration curve
        }}
        onClick={triggerTransition}
        title="Click to enter"
      >
        {/* Subtle radial background glow */}
        <div className="absolute w-[500px] h-[500px] bg-vulcan-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Central Logo Container with Camera Zoom Out */}
        <motion.div
          className="relative flex flex-col items-center justify-center"
          animate={{
            scale: isTransitioning ? 0.92 : 1,
            y: isTransitioning ? -8 : 0,
          }}
          transition={{
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Assembled Pixel Grid (softly blurs and dissolves out cleanly in first 220ms) */}
          <motion.div
            className="relative w-72 h-36 flex items-center justify-center"
            animate={{
              opacity: isTransitioning ? 0 : 1,
              filter: isTransitioning ? 'blur(3px)' : 'blur(0px)',
            }}
            transition={{
              duration: isTransitioning ? 0.22 : 0.4,
              ease: 'easeOut',
            }}
          >
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
                  opacity: 1,
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
                    duration: 0.4,
                    delay: p.delay,
                  },
                  scale: { duration: 0.4, delay: isAssembledOrLater ? 0.05 : p.delay },
                }}
              />
            ))}
          </motion.div>

          {/* Wordmark Reveal under Logo (fades out immediately when transition begins) */}
          <motion.div
            className="mt-6 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isTransitioning ? 0 : isAssembledOrLater ? 1 : 0,
              y: isTransitioning ? -5 : isAssembledOrLater ? 0 : 10,
            }}
            transition={{
              duration: isTransitioning ? 0.12 : 0.4,
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

        {/* Skip hint (fades out immediately when transition begins) */}
        <motion.div
          className="absolute bottom-6 font-mono text-[10px] text-vulcan-textFaint tracking-widest uppercase"
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.12 }}
        >
          [click or press any key to enter]
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
