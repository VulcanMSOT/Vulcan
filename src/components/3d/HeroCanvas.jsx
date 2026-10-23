import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Geometry strictly matching the official Vulcan {V} logo silhouette
 */
function VulcanEmblem({ mousePosition, isMobile }) {
  const groupRef = useRef();

  const { leftBraceGeo, vGeo, rightBraceGeo } = useMemo(() => {
    const extrudeSettings = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    };

    // Left Brace '{' - geometric stepped brackets matching logo
    const leftShape = new THREE.Shape();
    leftShape.moveTo(-2.4, 1.45);
    leftShape.lineTo(-1.8, 1.45);
    leftShape.lineTo(-1.8, 1.05);
    leftShape.lineTo(-2.05, 1.05);
    leftShape.lineTo(-2.05, 0.32);
    leftShape.lineTo(-2.45, 0.0);
    leftShape.lineTo(-2.05, -0.32);
    leftShape.lineTo(-2.05, -1.05);
    leftShape.lineTo(-1.8, -1.05);
    leftShape.lineTo(-1.8, -1.45);
    leftShape.lineTo(-2.4, -1.45);
    leftShape.lineTo(-2.4, -0.85);
    leftShape.lineTo(-2.6, -0.85);
    leftShape.lineTo(-2.8, 0.0);
    leftShape.lineTo(-2.6, 0.85);
    leftShape.lineTo(-2.4, 0.85);
    leftShape.closePath();

    // Solid Geometric 'V' (single continuous contour, no inverted hole artifact)
    const vShape = new THREE.Shape();
    vShape.moveTo(-1.3, 1.45);       // Top-left outer
    vShape.lineTo(-0.62, 1.45);      // Top-left inner
    vShape.lineTo(0.0, -0.5);        // Inner crotch
    vShape.lineTo(0.62, 1.45);       // Top-right inner
    vShape.lineTo(1.3, 1.45);        // Top-right outer
    vShape.lineTo(0.34, -1.45);      // Bottom-right outer
    vShape.lineTo(-0.34, -1.45);     // Bottom-left outer
    vShape.closePath();

    // Right Brace '}' - mirrored
    const rightShape = new THREE.Shape();
    rightShape.moveTo(2.4, 1.45);
    rightShape.lineTo(1.8, 1.45);
    rightShape.lineTo(1.8, 1.05);
    rightShape.lineTo(2.05, 1.05);
    rightShape.lineTo(2.05, 0.32);
    rightShape.lineTo(2.45, 0.0);
    rightShape.lineTo(2.05, -0.32);
    rightShape.lineTo(2.05, -1.05);
    rightShape.lineTo(1.8, -1.05);
    rightShape.lineTo(1.8, -1.45);
    rightShape.lineTo(2.4, -1.45);
    rightShape.lineTo(2.4, -0.85);
    rightShape.lineTo(2.6, -0.85);
    rightShape.lineTo(2.8, 0.0);
    rightShape.lineTo(2.6, 0.85);
    rightShape.lineTo(2.4, 0.85);
    rightShape.closePath();

    return {
      leftBraceGeo: new THREE.ExtrudeGeometry(leftShape, extrudeSettings),
      vGeo: new THREE.ExtrudeGeometry(vShape, extrudeSettings),
      rightBraceGeo: new THREE.ExtrudeGeometry(rightShape, extrudeSettings),
    };
  }, []);

  // Material: Smooth architectural off-white matte with subtle rim specularity
  const emblemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.22,
      metalness: 0.12,
    });
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth cursor tracking with gentle spring/lerp dampening
    const targetRotX = (mousePosition.y * 0.16) + (Math.sin(state.clock.elapsedTime * 0.7) * 0.025);
    const targetRotY = (mousePosition.x * 0.25) + (Math.cos(state.clock.elapsedTime * 0.5) * 0.035);
    const targetPosY = Math.sin(state.clock.elapsedTime * 1.1) * 0.06;

    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 3, delta);
  });

  return (
    <group ref={groupRef} scale={isMobile ? 0.72 : 1.05}>
      <mesh geometry={leftBraceGeo} material={emblemMaterial} castShadow receiveShadow />
      <mesh geometry={vGeo} material={emblemMaterial} castShadow receiveShadow />
      <mesh geometry={rightBraceGeo} material={emblemMaterial} castShadow receiveShadow />
    </group>
  );
}

/**
 * Floating Gold Pixel Embers breaking off the V stem (signature brand motif)
 */
function FloatingGoldPixels({ count = 80, mousePosition }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Clustered around top-right stem of V
      const isCore = i < count * 0.45;
      const x = isCore ? 0.5 + Math.random() * 0.9 : (Math.random() - 0.4) * 3.4;
      const y = isCore ? 0.3 + Math.random() * 1.5 : (Math.random() - 0.4) * 3.0;
      const z = (Math.random() - 0.5) * 1.6;
      const size = isCore ? 0.09 + Math.random() * 0.08 : 0.05 + Math.random() * 0.06;
      const speed = 0.4 + Math.random() * 0.7;
      const rotSpeed = 0.6 + Math.random() * 1.4;
      const initialPhase = Math.random() * Math.PI * 2;

      temp.push({ x, y, z, size, speed, rotSpeed, initialPhase });
    }
    return temp;
  }, [count]);

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xF5A623,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85,
    });
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      const currentY = p.y + Math.sin(time * p.speed + p.initialPhase) * 0.15 + (mousePosition.y * 0.18);
      const currentX = p.x + Math.cos(time * p.speed * 0.8 + p.initialPhase) * 0.12 + (mousePosition.x * 0.22);
      const currentZ = p.z + Math.sin(time * 0.5 + p.initialPhase) * 0.1;

      dummy.position.set(currentX, currentY, currentZ);
      dummy.rotation.x = time * p.rotSpeed * 0.3;
      dummy.rotation.y = time * p.rotSpeed * 0.5;
      dummy.rotation.z = time * p.rotSpeed * 0.2;
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[cubeGeo, goldMaterial, count]}
      castShadow
    />
  );
}

/**
 * Hero Canvas Container
 */
export default function HeroCanvas({ prefersReducedMotion }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 6, 5]} intensity={1.6} color="#ffffff" />
        <pointLight position={[3, 2, -2]} intensity={2.4} color="#F5A623" distance={8} />
        <directionalLight position={[-4, -3, 2]} intensity={0.4} color="#94a3b8" />

        <VulcanEmblem mousePosition={mousePosition} isMobile={isMobile} />
        <FloatingGoldPixels count={isMobile ? 35 : 75} mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
