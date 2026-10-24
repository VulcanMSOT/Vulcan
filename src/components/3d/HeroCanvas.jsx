import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LogoMark3DV2 from './LogoMark3DV2';

// Custom smooth cubic ease-in-out for camera dolly
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * R3F Scene Controller: manages real loading, shader warm-up,
 * instanced assembly sweep, seamless fuse, and camera zoom-out.
 */
function SceneController({
  isMobile,
  prefersReducedMotion,
  introSettled,
  onSettled,
  urlPhase,
  urlT,
  progressLineRef,
  setIsAssembled,
  setIsZooming,
}) {
  const { camera, gl, scene } = useThree();

  const startCameraZ = isMobile ? 2.55 : 2.95;
  const targetCameraZ = 5.2;

  // Animation timeline refs (60fps updates with zero React re-renders)
  const assemblyProgressRef = useRef(introSettled ? 1.0 : 0.0);
  const fuseProgressRef = useRef(introSettled ? 1.0 : 0.0);
  const solidOpacityRef = useRef(introSettled ? 1.0 : 0.0);
  const glintRef = useRef(0.0);
  const [showAssemblyMesh, setShowAssemblyMesh] = useState(!introSettled);

  // Loading synchronization
  const isLoadedRef = useRef(false);
  const startTimeRef = useRef(null);
  const settledRef = useRef(introSettled);

  // 1. Warm up shaders and wait for fonts before animation begins
  useEffect(() => {
    try {
      gl.compile(scene, camera);
    } catch {
      // Graceful fallback if compile fails
    }

    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        isLoadedRef.current = true;
      });
    } else {
      isLoadedRef.current = true;
    }
  }, [gl, scene, camera]);

  // 2. URL deterministic inspection overrides
  const isDeterministic = Boolean(urlPhase);
  useEffect(() => {
    if (!urlPhase) return;

    if (urlPhase === 'assembling') {
      const t = urlT !== null ? urlT : 0.5;
      assemblyProgressRef.current = t;
      fuseProgressRef.current = 0.0;
      solidOpacityRef.current = 0.0;
      glintRef.current = 0.0;
      camera.position.z = startCameraZ;
      setShowAssemblyMesh(true);
      setIsAssembled(t >= 0.95);
      setIsZooming(false);
      if (progressLineRef.current) {
        progressLineRef.current.style.width = `${t * 100}%`;
      }
    } else if (urlPhase === 'assembled') {
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = 0.0;
      solidOpacityRef.current = 0.0;
      glintRef.current = 0.0;
      camera.position.z = startCameraZ;
      setShowAssemblyMesh(true);
      setIsAssembled(true);
      setIsZooming(false);
      if (progressLineRef.current) {
        progressLineRef.current.style.width = '100%';
      }
    } else if (urlPhase === 'fuse') {
      const t = urlT !== null ? urlT : 0.5;
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = t;
      solidOpacityRef.current = t;
      glintRef.current = Math.sin(t * Math.PI);
      camera.position.z = startCameraZ;
      setShowAssemblyMesh(true);
      setIsAssembled(true);
      setIsZooming(false);
      if (progressLineRef.current) {
        progressLineRef.current.style.width = '100%';
      }
    } else if (urlPhase === 'zooming') {
      const t = urlT !== null ? urlT : 0.5;
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = 1.0;
      solidOpacityRef.current = 1.0;
      glintRef.current = 0.0;
      camera.position.z = startCameraZ + (targetCameraZ - startCameraZ) * easeInOutCubic(t);
      setShowAssemblyMesh(false);
      setIsAssembled(true);
      setIsZooming(true);
    } else if (urlPhase === 'done') {
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = 1.0;
      solidOpacityRef.current = 1.0;
      glintRef.current = 0.0;
      camera.position.z = targetCameraZ;
      setShowAssemblyMesh(false);
      setIsAssembled(true);
      setIsZooming(true);
      if (!settledRef.current) {
        settledRef.current = true;
        if (onSettled) onSettled();
      }
    }
  }, [urlPhase, urlT, startCameraZ, targetCameraZ, camera, onSettled, progressLineRef, setIsAssembled, setIsZooming]);

  // 3. 60fps Frame Loop Choreography
  useFrame((state) => {
    if (isDeterministic || settledRef.current) return;

    if (prefersReducedMotion) {
      camera.position.z = targetCameraZ;
      solidOpacityRef.current = 1.0;
      setShowAssemblyMesh(false);
      settledRef.current = true;
      if (onSettled) onSettled();
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime * 1000;
    }

    const elapsed = state.clock.elapsedTime * 1000 - startTimeRef.current;

    // Timeline definitions:
    // 0ms -> 1800ms: Assembly sweep
    // 1800ms -> 2050ms: Fuse (250ms)
    // 2050ms -> 2350ms: Hold beat (300ms)
    // 2350ms -> 3550ms: Camera zoom-out dolly (1200ms)
    // 3550ms+: Settled
    const ASSEMBLY_DURATION = 1800;
    const FUSE_START = 1800;
    const FUSE_DURATION = 250;
    const ZOOM_START = 2350;
    const ZOOM_DURATION = 1200;
    const SETTLE_TIME = 3550;

    // Phase A: Assembly
    if (elapsed < FUSE_START) {
      camera.position.z = startCameraZ;
      let rawP = elapsed / ASSEMBLY_DURATION;

      // Real loading gate: if assets not loaded by 85%, hold at 85% until ready
      if (!isLoadedRef.current && rawP > 0.85) {
        rawP = 0.85;
      }

      const p = THREE.MathUtils.clamp(rawP, 0, 1);
      assemblyProgressRef.current = p;
      fuseProgressRef.current = 0.0;
      solidOpacityRef.current = 0.0;
      glintRef.current = 0.0;

      if (progressLineRef.current) {
        progressLineRef.current.style.width = `${Math.round(p * 100)}%`;
      }
      return;
    }

    // Phase B: Fuse (1800ms -> 2050ms)
    if (elapsed < FUSE_START + FUSE_DURATION) {
      camera.position.z = startCameraZ;
      assemblyProgressRef.current = 1.0;
      const fuseP = (elapsed - FUSE_START) / FUSE_DURATION;
      fuseProgressRef.current = fuseP;
      solidOpacityRef.current = fuseP;
      glintRef.current = Math.sin(fuseP * Math.PI);

      setIsAssembled(true);
      if (progressLineRef.current) {
        progressLineRef.current.style.width = '100%';
      }
      return;
    }

    // Phase C: Hold beat (2050ms -> 2350ms)
    if (elapsed < ZOOM_START) {
      camera.position.z = startCameraZ;
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = 1.0;
      solidOpacityRef.current = 1.0;
      glintRef.current = 0.0;
      if (showAssemblyMesh) setShowAssemblyMesh(false);
      return;
    }

    // Phase D: Camera Dolly Zoom-out (2350ms -> 3550ms)
    if (elapsed < SETTLE_TIME) {
      const zoomP = (elapsed - ZOOM_START) / ZOOM_DURATION;
      const eased = easeInOutCubic(zoomP);

      camera.position.z = startCameraZ + (targetCameraZ - startCameraZ) * eased;
      assemblyProgressRef.current = 1.0;
      fuseProgressRef.current = 1.0;
      solidOpacityRef.current = 1.0;
      glintRef.current = 0.0;

      setIsZooming(true);
      return;
    }

    // Phase E: Settled
    camera.position.z = targetCameraZ;
    assemblyProgressRef.current = 1.0;
    fuseProgressRef.current = 1.0;
    solidOpacityRef.current = 1.0;
    glintRef.current = 0.0;

    if (!settledRef.current) {
      settledRef.current = true;
      if (onSettled) onSettled();
    }
  });

  return (
    <LogoMark3DV2
      isMobile={isMobile}
      prefersReducedMotion={prefersReducedMotion}
      assemblyProgress={assemblyProgressRef}
      fuseProgress={fuseProgressRef}
      showAssemblyMesh={showAssemblyMesh}
      solidOpacity={solidOpacityRef}
      glint={glintRef}
    />
  );
}

/**
 * Hero Canvas Container - Persistent 3D scene hosting the Intro Loader assembly,
 * camera zoom-out dolly, and interactive thin-slab emblem.
 */
export default function HeroCanvas({
  prefersReducedMotion,
  introSettled = false,
  onSettled,
}) {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;

  const urlPhase = searchParams ? searchParams.get('phase') : null;
  const urlT = searchParams && searchParams.get('t') ? parseFloat(searchParams.get('t')) : null;
  const urlTilt = searchParams ? searchParams.get('tilt') : null;

  const initialMouse = urlTilt === 'left'
    ? { x: -0.85, y: 0.1 }
    : urlTilt === 'right'
    ? { x: 0.85, y: -0.1 }
    : { x: 0, y: 0 };

  const [mousePosition, setMousePosition] = useState(initialMouse);
  const [isMobile, setIsMobile] = useState(false);
  const [isAssembled, setIsAssembled] = useState(() => urlPhase === 'assembled' || urlPhase === 'fuse' || urlPhase === 'zooming' || urlPhase === 'done' || introSettled);
  const [isZooming, setIsZooming] = useState(() => urlPhase === 'zooming' || urlPhase === 'done' || introSettled);

  const progressLineRef = useRef(null);

  // Responsive device check and mouse tracking
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

  // Clean scroll lock management without layout shift
  useEffect(() => {
    if (introSettled || prefersReducedMotion || urlPhase === 'done') {
      document.body.style.overflow = '';
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [introSettled, prefersReducedMotion, urlPhase]);

  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none" aria-label="Vulcan Emblem">
        <div className="relative font-mono font-bold text-7xl md:text-9xl text-white tracking-widest flex items-center">
          <span className="text-zinc-400">&#123;</span>
          <span className="text-white relative mx-2">
            V
            <span className="absolute -top-1 -right-3 w-3 h-3 bg-[#E8590C] shadow-[0_0_10px_#F76707]" />
          </span>
          <span className="text-zinc-400">&#125;</span>
        </div>
      </div>
    );
  }

  const initialCameraZ = isMobile ? 2.55 : 2.95;

  return (
    <div className="w-full h-full relative" aria-label="Vulcan Emblem">
      {/* Accessible status for assistive technology */}
      {!introSettled && (
        <div role="status" className="sr-only">
          Loading Vulcan interactive experience...
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, introSettled ? 5.2 : initialCameraZ], fov: 45 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        className="w-full h-full"
      >
        {/* Studio lighting tuned for crisp white front faces and rim specularity */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[0, 4, 10]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[0, 8, 2]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-4, -3, 4]} intensity={0.4} color="#f0f4f8" />
        <pointLight position={[2, 1, 3]} intensity={1.2} color="#E8590C" distance={8} />

        <SceneController
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
          introSettled={introSettled}
          onSettled={onSettled}
          urlPhase={urlPhase}
          urlT={urlT}
          progressLineRef={progressLineRef}
          setIsAssembled={setIsAssembled}
          setIsZooming={setIsZooming}
        />
      </Canvas>

      {/* Intro Overlay UI: Thin progress line and official wordmark */}
      {!introSettled && (
        <div
          className={`absolute inset-x-0 bottom-2 sm:bottom-4 flex flex-col items-center justify-center gap-2.5 pointer-events-none transition-opacity duration-500 ${
            isZooming ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* 1. Thin loading progress line (fades out at fuse) */}
          <div
            className={`w-28 sm:w-36 h-[1.5px] bg-white/10 rounded-full overflow-hidden transition-opacity duration-300 ${
              isAssembled ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div
              ref={progressLineRef}
              className="h-full bg-gradient-to-r from-white/40 via-vulcan-gold to-white rounded-full transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>

          {/* 2. Official 'vulcan club' wordmark (fades in once assembled) */}
          <div
            className={`transition-all duration-500 ease-out flex flex-col items-center ${
              isAssembled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white lowercase">
              vulcan club
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
