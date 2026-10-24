import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pixel coordinates in 3D space forming the {V} emblem
 */
const V_3D_POINTS = [
  // Left Brace '{'
  { x: -2.3, y: 1.3, isGold: false },
  { x: -1.9, y: 1.3, isGold: false },
  { x: -2.1, y: 0.8, isGold: false },
  { x: -2.1, y: 0.3, isGold: false },
  { x: -2.5, y: 0.0, isGold: false },
  { x: -2.1, y: -0.3, isGold: false },
  { x: -2.1, y: -0.8, isGold: false },
  { x: -1.9, y: -1.3, isGold: false },
  { x: -2.3, y: -1.3, isGold: false },

  // Left Arm of V
  { x: -1.3, y: 1.3, isGold: false },
  { x: -1.0, y: 0.8, isGold: false },
  { x: -0.7, y: 0.3, isGold: false },
  { x: -0.4, y: -0.3, isGold: false },
  { x: -0.15, y: -0.9, isGold: false },
  { x: 0.0, y: -1.3, isGold: false },

  // Right Arm of V
  { x: 0.15, y: -0.9, isGold: false },
  { x: 0.4, y: -0.3, isGold: false },
  { x: 0.7, y: 0.3, isGold: false },
  { x: 1.0, y: 0.8, isGold: false },
  { x: 1.3, y: 1.3, isGold: false },

  // Signature Gold Sparks Breaking Off Top Right
  { x: 1.55, y: 1.5, isGold: true },
  { x: 1.8, y: 1.25, isGold: true },
  { x: 1.45, y: 0.95, isGold: true },
  { x: 1.7, y: 0.65, isGold: true },

  // Right Brace '}'
  { x: 2.3, y: 1.3, isGold: false },
  { x: 1.9, y: 1.3, isGold: false },
  { x: 2.1, y: 0.8, isGold: false },
  { x: 2.1, y: 0.3, isGold: false },
  { x: 2.5, y: 0.0, isGold: false },
  { x: 2.1, y: -0.3, isGold: false },
  { x: 2.1, y: -0.8, isGold: false },
  { x: 1.9, y: -1.3, isGold: false },
  { x: 2.3, y: -1.3, isGold: false },
];

function ConvergingPixels({ progress }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute dispersed origin and target positions for each pixel
  const particles = useMemo(() => {
    return V_3D_POINTS.map((pt, i) => {
      // Dispersed outer point
      const angle = (i / V_3D_POINTS.length) * Math.PI * 2;
      const radius = 3.5 + (i % 5) * 0.6;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius * 0.8;
      const startZ = ((i % 7) - 3) * 0.8;

      return {
        startX,
        startY,
        startZ,
        targetX: pt.x * 0.8,
        targetY: pt.y * 0.8,
        targetZ: 0,
        isGold: pt.isGold,
        size: pt.isGold ? 0.12 : 0.11,
      };
    });
  }, []);

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const whiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }), []);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xE8590C,
    emissive: 0xD9480F,
    emissiveIntensity: 0.85,
    roughness: 0.28,
    metalness: 0.05,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Eased progress (clamped 0 to 1)
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    const easeT = 1 - Math.pow(1 - t, 3); // cubic ease-out

    particles.forEach((p, i) => {
      // Interpolate from start to target
      const curX = THREE.MathUtils.lerp(p.startX, p.targetX, easeT);
      const curY = THREE.MathUtils.lerp(p.startY, p.targetY, easeT) + Math.sin(time + i) * 0.02 * easeT;
      const curZ = THREE.MathUtils.lerp(p.startZ, p.targetZ, easeT);

      dummy.position.set(curX, curY, curZ);
      dummy.scale.setScalar(p.size);
      dummy.rotation.x = time * 0.4 * (1 - easeT * 0.8);
      dummy.rotation.y = time * 0.6 * (1 - easeT * 0.8);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[cubeGeo, goldMat, particles.length]}
    />
  );
}

export default function ClosingCanvas({ progress, prefersReducedMotion }) {
  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center font-mono text-4xl text-zinc-400">
        &#123; <span className="text-white font-bold mx-1">V</span> &#125;
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 4]} intensity={1.5} />
        <pointLight position={[0, 0, 2]} intensity={1.8} color="#E8590C" distance={6} />
        <ConvergingPixels progress={progress} />
      </Canvas>
    </div>
  );
}
