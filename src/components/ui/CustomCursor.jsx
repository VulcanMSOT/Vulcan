import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Emil Kowalski spring configuration for natural physical momentum
  const springX = useSpring(mouseX, { stiffness: 450, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 450, damping: 28 });

  // Trailing ember spring
  const trailX = useSpring(mouseX, { stiffness: 220, damping: 22 });
  const trailY = useSpring(mouseY, { stiffness: 220, damping: 22 });

  useEffect(() => {
    // Only activate cursor on fine pointer devices (desktops/laptops)
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFinePointer(media.matches);

    const updateMedia = (e) => setIsFinePointer(e.matches);
    media.addEventListener('change', updateMedia);

    if (!media.matches) return () => media.removeEventListener('change', updateMedia);

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onMouseEnter = (e) => {
      if (e.clientX && e.clientY) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setVisible(true);
      }
    };
    const onMouseLeave = () => setVisible(false);

    // Track interactive hovers
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      media.removeEventListener('change', updateMedia);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY, visible]);

  if (!isFinePointer || !visible) return null;

  return (
    <>
      {/* Primary Dot Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: 'translate(-50%, -50%)',
          x: springX,
          y: springY,
        }}
        aria-hidden="true"
      >
        <motion.div
          animate={{
            scale: hovered ? 2.2 : 1,
            backgroundColor: hovered ? '#ffffff' : '#ffffff',
          }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="w-2.5 h-2.5 rounded-full"
        />
      </motion.div>

      {/* Trailing Gold Pixel Spark Motif */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          transform: 'translate(-50%, -50%)',
          x: trailX,
          y: trailY,
        }}
        aria-hidden="true"
      >
        <motion.div
          animate={{
            scale: hovered ? 1.5 : 1,
            rotate: hovered ? 45 : 0,
            opacity: hovered ? 0.9 : 0.6,
          }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-1.5 h-1.5 bg-vulcan-gold shadow-[0_0_8px_rgba(245,166,35,0.7)]"
        />
      </motion.div>
    </>
  );
}
