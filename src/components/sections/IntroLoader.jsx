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

export default function IntroLoader({ onComplete, prefersReducedMotion }) {
  const [phase, setPhase] = useState('assembling'); // 'assembling' | 'locked' | 'exiting' | 'done'

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
            delay: Math.random() * 0.45,
          });
        }
      });
    });
    return points;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }

    // Phase 1: Assembling (0 - 1.2s)
    const lockTimer = setTimeout(() => {
      setPhase('locked');
    }, 1250);

    // Phase 2: Lock & glow (1.25s - 2.0s)
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 2100);

    // Phase 3: Exit completed (2.5s)
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(lockTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[100] bg-vulcan-bg flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          onClick={() => {
            setPhase('done');
            onComplete();
          }}
          title="Click to skip"
        >
          {/* Subtle radial background glow */}
          <div className="absolute w-[500px] h-[500px] bg-vulcan-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Central Assembly Canvas / Grid */}
          <div className="relative w-72 h-64 flex items-center justify-center">
            {pixelPoints.map((p) => {
              const isLocked = phase === 'locked' || phase === 'exiting';

              return (
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
                    scale: isLocked && p.isGold ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    x: {
                      duration: 0.95,
                      delay: p.delay,
                      ease: [0.23, 1, 0.32, 1], // Emil strong ease-out
                    },
                    y: {
                      duration: 0.95,
                      delay: p.delay,
                      ease: [0.23, 1, 0.32, 1],
                    },
                    opacity: { duration: 0.4, delay: p.delay },
                    scale: { duration: 0.4, delay: isLocked ? 0.1 : p.delay },
                  }}
                />
              );
            })}
          </div>

          {/* Wordmark Reveal */}
          <motion.div
            className="mt-6 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'locked' || phase === 'exiting' ? 1 : 0,
              y: phase === 'locked' || phase === 'exiting' ? 0 : 10,
            }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="font-sans font-bold text-xl tracking-tight text-white lowercase">
              vulcan club
            </span>
            <span className="font-mono text-[11px] text-vulcan-textMuted tracking-wider uppercase">
              assembling system
            </span>
          </motion.div>

          {/* Skip hint */}
          <div className="absolute bottom-6 font-mono text-[10px] text-vulcan-textFaint tracking-widest uppercase">
            [click or press any key to enter]
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
