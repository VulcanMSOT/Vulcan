import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import LogoMark3DV2 from './LogoMark3DV2';

/**
 * Hero Canvas Container - 3D Vulcan {V} Thin-Slab Emblem
 */
export default function HeroCanvas({ prefersReducedMotion }) {
  const urlTilt = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('tilt')
    : null;

  const initialMouse = urlTilt === 'left'
    ? { x: -0.85, y: 0.1 }
    : urlTilt === 'right'
    ? { x: 0.85, y: -0.1 }
    : { x: 0, y: 0 };

  const [mousePosition, setMousePosition] = useState(initialMouse);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none" aria-label="Vulcan {V} Emblem">
        <div className="relative font-mono font-bold text-7xl md:text-9xl text-white tracking-widest flex items-center">
          <span className="text-zinc-400">&#123;</span>
          <span className="text-white relative mx-2">
            V
            <span className="absolute -top-1 -right-3 w-3 h-3 bg-vulcan-gold shadow-[0_0_10px_#F5A623]" />
          </span>
          <span className="text-zinc-400">&#125;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        className="w-full h-full"
      >
        {/* Studio lighting tuned for crisp white front faces and rim specularity */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[0, 4, 10]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[0, 8, 2]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-4, -3, 4]} intensity={0.4} color="#f0f4f8" />
        <pointLight position={[2, 1, 3]} intensity={1.2} color="#D9B857" distance={8} />

        <LogoMark3DV2
          mousePosition={mousePosition}
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}
