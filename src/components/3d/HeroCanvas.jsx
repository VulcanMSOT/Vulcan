import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LogoMark3DV2 from './LogoMark3DV2';
import { computeHeroFraming } from './heroFraming';

/**
 * Camera controller that enforces exact framing calculated by computeHeroFraming.
 * Animates a smooth physical zoom-out deceleration during loader handover,
 * and snaps strictly to final framing if interrupted or when settled.
 */
function HeroCameraController({
  framing,
  mousePosition,
  isTransitioning,
  introSettled,
  prefersReducedMotion,
}) {
  const { camera, size, scene } = useThree();
  const transitionStartRef = useRef(null);

  useEffect(() => {
    if (isTransitioning) {
      transitionStartRef.current = performance.now();
    }
  }, [isTransitioning]);

  useFrame((state, delta) => {
    // 1. Traverse scene to collect debug metrics
    let logoGroup = null;
    scene.traverse((child) => {
      if (child.isGroup && child.children.some(c => c.isMesh && c.geometry?.type === 'ExtrudeGeometry')) {
        logoGroup = child;
      }
    });

    if (framing) {
      const { cameraZ, cameraY } = framing;

      // Zoom-out transition progress (0 -> 1 over 800ms)
      let zoomProgress = 1;
      if (!introSettled && isTransitioning && transitionStartRef.current) {
        const elapsed = performance.now() - transitionStartRef.current;
        const t = Math.min(1, elapsed / 800);
        // Smooth cubic deceleration [0.16, 1, 0.3, 1]
        zoomProgress = 1 - Math.pow(1 - t, 3);
      } else if (introSettled) {
        zoomProgress = 1;
      }

      // Camera starts at 0.68 * cameraZ (close zoom) and eases out to 1.0 * cameraZ
      const startZ = cameraZ * 0.68;
      const targetZ = prefersReducedMotion ? cameraZ : (startZ + (cameraZ - startZ) * zoomProgress);
      const targetY = cameraY;

      // Subtle parallax & breathing float around the target framing
      const parallaxY = (!introSettled || prefersReducedMotion)
        ? 0
        : (mousePosition.y * 0.04) + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;

      camera.position.x = 0;
      camera.position.y = targetY + parallaxY;
      camera.position.z = targetZ;
      camera.lookAt(0, targetY + parallaxY, 0);
    }

    // Expose runtime 3D and projected 2D coordinates for automated test verification
    if (logoGroup) {
      const box = new THREE.Box3().setFromObject(logoGroup);
      const center = new THREE.Vector3();
      const size3D = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size3D);

      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];

      let minScreenX = Infinity, maxScreenX = -Infinity;
      let minScreenY = Infinity, maxScreenY = -Infinity;

      corners.forEach((corner) => {
        const v = corner.clone().project(camera);
        const sx = ((v.x + 1) * 0.5) * size.width;
        const sy = ((-v.y + 1) * 0.5) * size.height;
        if (sx < minScreenX) minScreenX = sx;
        if (sx > maxScreenX) maxScreenX = sx;
        if (sy < minScreenY) minScreenY = sy;
        if (sy > maxScreenY) maxScreenY = sy;
      });

      window.__HERO_3D_DEBUG__ = {
        camera: {
          position: [camera.position.x, camera.position.y, camera.position.z],
          fov: camera.fov,
          zoom: camera.zoom,
          aspect: camera.aspect,
          near: camera.near,
          far: camera.far,
        },
        canvasSize: { width: size.width, height: size.height },
        logoWorldBounds: {
          min: [box.min.x, box.min.y, box.min.z],
          max: [box.max.x, box.max.y, box.max.z],
          size: [size3D.x, size3D.y, size3D.z],
          center: [center.x, center.y, center.z],
        },
        logoScreenBounds: {
          left: minScreenX,
          top: minScreenY,
          right: maxScreenX,
          bottom: maxScreenY,
          width: maxScreenX - minScreenX,
          height: maxScreenY - minScreenY,
        },
        framing,
      };
    }
  });

  return null;
}

export default function HeroCanvas({
  prefersReducedMotion = false,
  introSettled = true,
  isTransitioning = false,
}) {
  const containerRef = useRef(null);

  const urlTilt = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('tilt')
    : null;

  const initialMouse = urlTilt === 'left'
    ? { x: -0.85, y: 0.1 }
    : urlTilt === 'right'
    ? { x: 0.85, y: -0.1 }
    : { x: 0, y: 0 };

  const [mousePosition, setMousePosition] = useState(initialMouse);
  const [framing, setFraming] = useState(null);

  const updateFraming = useCallback(() => {
    if (!containerRef.current) return;
    const canvasEl = containerRef.current.querySelector('canvas') || containerRef.current;
    const canvasRect = canvasEl.getBoundingClientRect();
    const titleEl = document.querySelector('#hero h1');
    const headerEl = document.querySelector('#hero header');

    const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;
    const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;

    const newFraming = computeHeroFraming({
      logoWorldBounds: { size: [5.60, 2.78, 0.22], center: [0, 0, 0] },
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      titleTop: titleRect ? titleRect.top : null,
      canvasTop: canvasRect.top,
      headerBottom: headerRect ? headerRect.bottom : 0,
      fov: 45,
    });

    setFraming(newFraming);
  }, []);

  useEffect(() => {
    updateFraming();

    // 1. Viewport resize and orientation change
    window.addEventListener('resize', updateFraming);
    window.addEventListener('orientationchange', updateFraming);

    // 2. ResizeObserver on canvas container (catches page zoom, CSS size changes)
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(updateFraming);
      ro.observe(containerRef.current);
    }

    // 3. When fonts settle (h1 text size changes)
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateFraming);
    }

    // 4. Staggered timers as scroll lock is released and DOM layout settles
    const t1 = setTimeout(updateFraming, 100);
    const t2 = setTimeout(updateFraming, 400);
    const t3 = setTimeout(updateFraming, 1000);

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', updateFraming);
      window.removeEventListener('orientationchange', updateFraming);
      window.removeEventListener('pointermove', handlePointerMove);
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [updateFraming, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none" aria-label="Vulcan {V} Emblem">
        <div className="relative font-mono font-bold text-7xl md:text-9xl text-white tracking-widest flex items-center">
          <span className="text-zinc-400">&#123;</span>
          <span className="text-white relative mx-2">
            V
            <span className="absolute -top-1 -right-3 w-3 h-3 bg-vulcan-gold shadow-[0_0_10px_#E8590C]" />
          </span>
          <span className="text-zinc-400">&#125;</span>
        </div>
      </div>
    );
  }

  const initialCamZ = framing ? framing.cameraZ : 5.2;
  const initialCamY = framing ? framing.cameraY : 0;

  return (
    <div ref={containerRef} className="w-full h-full relative" aria-hidden="true">
      <Canvas
        camera={{ position: [0, initialCamY, initialCamZ], fov: 45 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        className="w-full h-full"
      >
        <HeroCameraController
          framing={framing}
          mousePosition={mousePosition}
          isTransitioning={isTransitioning}
          introSettled={introSettled}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Studio lighting tuned for crisp white front faces, bevel specularity and deep orange ember glow */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 6]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-3, -2, 4]} intensity={0.4} color="#f0f4f8" />
        <pointLight position={[1.5, 0.8, 2]} intensity={1.5} color="#E8590C" distance={8} />

        <LogoMark3DV2
          mousePosition={mousePosition}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}
