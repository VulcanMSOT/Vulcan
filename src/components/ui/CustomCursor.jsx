import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Smooth physical spring tracking (Emil Kowalski design specs)
  const springX = useSpring(mouseX, { stiffness: 600, damping: 36 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 36 });

  useEffect(() => {
    // Only desktop / fine pointer devices
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFinePointer(media.matches);

    const updateMedia = (e) => setIsFinePointer(e.matches);
    media.addEventListener('change', updateMedia);

    if (!media.matches) return () => media.removeEventListener('change', updateMedia);

    let idleTimeout = null;

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        setVisible(false);
      }, 2200);
    };

    const onMouseLeave = () => {
      clearTimeout(idleTimeout);
      setVisible(false);
    };

    const onMouseEnter = (e) => {
      if (e.clientX && e.clientY) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setVisible(true);
      }
    };

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
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('blur', onMouseLeave);

    return () => {
      media.removeEventListener('change', updateMedia);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('blur', onMouseLeave);
    };
  }, [mouseX, mouseY, visible]);

  if (!isFinePointer || !visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: 'translate(-50%, -50%)',
        x: springX,
        y: springY,
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={{
          scale: hovered ? 1.75 : 1,
          opacity: hovered ? 0.95 : 0.8,
        }}
        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
      />
    </motion.div>
  );
}
