import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function MoltenForgeCore({
  sceneState = 'intro',
  prefersReducedMotion = false,
  isMobile = false,
}) {
  const coreGroupRef = useRef();
  const ringRef = useRef();

  useFrame((_state, delta) => {
    if (!coreGroupRef.current) return;
    const isIntro = sceneState === 'intro';
    const isSubmitting = sceneState === 'submitting';

    // Desktop intro: positioned under the logo at x ~1.85, y ~ -1.15
    // Mobile intro: positioned under the logo at x: 0, y ~0.25
    let targetX = 0;
    let targetY = -1.2;
    let targetZ = -0.5;
    let targetScale = 0.85;

    if (isIntro) {
      targetX = isMobile ? 0 : 1.85;
      targetY = isMobile ? 0.25 : -1.15;
      targetZ = isMobile ? 0.2 : -0.2;
      targetScale = isMobile ? 0.65 : 0.85;
    } else if (sceneState === 'form') {
      targetX = 0;
      targetY = -1.5;
      targetZ = -1.5;
      targetScale = 0.6;
    } else if (isSubmitting) {
      targetX = 0;
      targetY = -1.3;
      targetScale = 0.95;
    }

    const lerpRate = Math.min(1.0, 4.0 * delta);
    coreGroupRef.current.position.x += (targetX - coreGroupRef.current.position.x) * lerpRate;
    coreGroupRef.current.position.y += (targetY - coreGroupRef.current.position.y) * lerpRate;
    coreGroupRef.current.position.z += (targetZ - coreGroupRef.current.position.z) * lerpRate;

    const curScale = coreGroupRef.current.scale.x;
    const nextScale = curScale + (targetScale - curScale) * lerpRate;
    coreGroupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Slow rotation
    if (!prefersReducedMotion && ringRef.current) {
      ringRef.current.rotation.z += 0.06 * delta;
    }
  });

  return (
    <group ref={coreGroupRef} position={[0, -1.2, 0]}>
      {/* 1. Glossy dark reflective floor (Desktop only: faint reflection of the logo) */}
      {!isMobile && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.5, 5.5]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.35}
            mixBlur={1.0}
            mixStrength={1.4}
            roughness={0.65}
            depthScale={0.8}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.5}
            color="#080504"
            metalness={0.75}
          />
        </mesh>
      )}

      {/* 2. Thin glowing orange ring on the floor (~40% opacity) */}
      <group ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.95, 0.005, 12, 64]} />
          <meshBasicMaterial
            color="#C2410C"
            transparent
            opacity={0.40}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Faint floor grid lines fading out with distance */}
        <gridHelper
          args={[2.8, 14, '#C2410C', '#7C2D12']}
          position={[0, 0.002, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color="#7C2D12"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
          />
        </gridHelper>
      </group>
    </group>
  );
}
