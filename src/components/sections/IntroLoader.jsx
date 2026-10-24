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

export default function IntroLoader({
  onComplete,
  onSettled,
  onCrossfadeStart,
  prefersReducedMotion,
}) {
  // URL phase override for deterministic visual inspection & testing
  const urlPhase = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('phase')
    : null;

  // 'assembling' -> 'assembled' (hold beat) -> 'zooming' (continuous pull back 1.2s) -> 'done'
  const [phase, setPhase] = useState(() => urlPhase || 'assembling');
  const [crossfadeActive, setCrossfadeActive] = useState(() => urlPhase === 'done');

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

  // Dynamically compute exact target scale and Y offset to seamlessly match 3D HeroCanvas
  const [targetMetrics, setTargetMetrics] = useState(() => {
    if (typeof window === 'undefined') return { scale: 2.71, y: -67.0 };
    const isMobile = window.innerWidth < 768;
    return isMobile ? { scale: 1.06, y: -59.0 } : { scale: 2.71, y: -67.0 };
  });

  useEffect(() => {
    const updateMetrics = () => {
      const isMobile = window.innerWidth < 768;
      const container = document.getElementById('hero-canvas-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        const offsetY = centerY - viewportCenterY;
        const scale = isMobile ? 1.06 : 2.71;
        setTargetMetrics({ scale, y: Math.round(offsetY * 10) / 10 });
      } else {
        setTargetMetrics(isMobile ? { scale: 1.06, y: -59.0 } : { scale: 2.71, y: -67.0 });
      }
    };
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

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

  const triggerSkip = () => {
    document.body.style.overflow = '';
    setPhase('done');
    setCrossfadeActive(true);
    if (onCrossfadeStart) onCrossfadeStart();
    if (onSettled) onSettled();
    if (onComplete) onComplete();
  };

  // Lock scrolling during the loader and release cleanly on settle or skip
  useEffect(() => {
    if (urlPhase === 'done' || shouldSkip) {
      if (onCrossfadeStart) onCrossfadeStart();
      if (onSettled) onSettled();
      if (onComplete) onComplete();
      return;
    }
    if (urlPhase) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 1. Assembling (0.0s -> 1.15s)
    const holdTimer = setTimeout(() => {
      setPhase('assembled'); // Hold for a beat
    }, 1150);

    // 2. Hold beat (1.15s -> 1.65s) -> Begin zoom-out camera transition (1.2s duration)
    const zoomTimer = setTimeout(() => {
      setPhase('zooming');
    }, 1650);

    // 2.5 Crossfade start (2.55s, 300ms before settle): 3D canvas fades in, 2D loader dissolves
    const crossfadeTimer = setTimeout(() => {
      setCrossfadeActive(true);
      if (onCrossfadeStart) onCrossfadeStart();
    }, 2550);

    // 3. Zoom-out transition settles (1.65s + 1.2s = 2.85s): unlock scroll cleanly
    const settleTimer = setTimeout(() => {
      document.body.style.overflow = originalOverflow;
      if (onSettled) onSettled();
    }, 2850);

    // 4. Complete and unmount loader (2.95s)
    const completeTimer = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2950);

    // Keyboard skip support ("press any key to enter")
    const handleKeyDown = (e) => {
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      document.body.style.overflow = originalOverflow;
      setPhase('done');
      setCrossfadeActive(true);
      if (onCrossfadeStart) onCrossfadeStart();
      if (onSettled) onSettled();
      if (onComplete) onComplete();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(holdTimer);
      clearTimeout(zoomTimer);
      clearTimeout(crossfadeTimer);
      clearTimeout(settleTimer);
      clearTimeout(completeTimer);
    };
  }, [shouldSkip, urlPhase, onComplete, onSettled, onCrossfadeStart]);

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
          opacity: crossfadeActive ? 0 : 1,
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        onClick={triggerSkip}
        title="Click to skip"
      >
        {/* Subtle radial background glow */}
        <div className="absolute w-[500px] h-[500px] bg-vulcan-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Central Logo Container with Camera Zoom Out matching 3D Hero scale & position */}
        <div className="relative flex flex-col items-center justify-center">
          <motion.div
            className="relative w-72 h-36 flex items-center justify-center"
            animate={{
              scale: isMidZoom ? 1.8 : isZooming ? targetMetrics.scale : 1,
              y: isMidZoom ? targetMetrics.y * 0.5 : isZooming ? targetMetrics.y : 0,
              opacity: crossfadeActive ? 0 : 1,
              filter: crossfadeActive ? 'blur(2px)' : 'blur(0px)',
            }}
            transition={{
              scale: {
                duration: isMidZoom ? 0 : 1.2,
                ease: [0.65, 0, 0.35, 1], // Smooth continuous camera pullback
              },
              y: {
                duration: isMidZoom ? 0 : 1.2,
                ease: [0.65, 0, 0.35, 1],
              },
              opacity: {
                duration: 0.3,
                ease: 'easeOut',
              },
              filter: {
                duration: 0.3,
                ease: 'easeOut',
              },
            }}
          >
            {/* Assembled Pixel Grid */}
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

          {/* Wordmark Reveal under Logo (positioned relative to logo, fades out in first 200ms of zoom) */}
          <motion.div
            className="absolute top-[calc(100%+16px)] flex flex-col items-center gap-1.5 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isZooming ? 0 : isAssembledOrLater ? 1 : 0,
              y: isZooming ? -5 : isAssembledOrLater ? 0 : 10,
            }}
            transition={{
              duration: isZooming ? 0.2 : 0.4,
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
        </div>

        {/* Skip hint (fades out in first 200ms of zoom) */}
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
