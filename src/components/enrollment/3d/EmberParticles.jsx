import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a fine circular point texture (1-3px feel)
function createFineSparkTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(249, 115, 22, 0.9)');
  gradient.addColorStop(0.75, 'rgba(253, 186, 116, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function EmberParticles({
  count = 50,
  isMobile = false,
  _sceneState = 'intro',
  prefersReducedMotion = false,
}) {
  const pointsRef = useRef();

  // Desktop: 40 to 60 particles (default 50), Mobile: 20 particles
  const particleCount = useMemo(() => {
    return isMobile ? 20 : Math.min(Math.max(count, 40), 60);
  }, [count, isMobile]);

  const sparkTexture = useMemo(() => createFineSparkTexture(), []);

  // Initialize deterministic ember positions & attributes
  const sim = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    const data = [];

    // Colors strictly #F97316 and #FDBA74
    const colorA = new THREE.Color('#F97316');
    const colorB = new THREE.Color('#FDBA74');

    const prng = (i, offset) => {
      const v = Math.sin(i * 12.9898 + offset * 78.233) * 43758.5453;
      return (v - Math.floor(v));
    };

    for (let i = 0; i < particleCount; i++) {
      const r1 = prng(i, 1);
      const r2 = prng(i, 2);
      const r3 = prng(i, 3);
      const r4 = prng(i, 4);
      const r5 = prng(i, 5);

      // Concentrated around the logo region (desktop: x centered around 1.85, span 0.4 to 3.5)
      // Left text block (x < 0.2) has very few / faint particles
      let x;
      if (isMobile) {
        x = -1.6 + r1 * 3.2;
      } else {
        // 75% of particles around logo on right, 25% faint across left
        x = r4 > 0.25 ? (0.6 + r1 * 2.8) : (-3.2 + r1 * 3.2);
      }

      const y = -2.2 + r2 * 4.8;
      const z = -1.2 + r3 * 2.8;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const chosenColor = r4 > 0.5 ? colorA : colorB;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      // Tiny 1-3px scale (fainter if over text block x < 0.2)
      const isOverText = !isMobile && x < 0.2;
      sz[i] = isOverText ? (2.0 + r5 * 1.5) : (4.0 + r5 * 3.5);

      // Slow rising: 8 to 14s per vertical rise (~0.28 to 0.42 units/s)
      data.push({
        baseX: x,
        vy: 0.26 + r1 * 0.16,
        phase: r2 * Math.PI * 2,
        swaySpeed: 0.3 + r3 * 0.4,
        driftAmp: 0.15 + r4 * 0.2,
        isOverText,
      });
    }

    return {
      positions: pos,
      colors: col,
      sizes: sz,
      data,
    };
  }, [particleCount, isMobile]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !sim || prefersReducedMotion) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < particleCount; i++) {
      const p = sim.data[i];
      if (!p) continue;

      // Slow upward glide
      posAttr.array[i * 3 + 1] += p.vy * delta;

      // Gentle horizontal drift
      posAttr.array[i * 3] = p.baseX + Math.sin(t * p.swaySpeed + p.phase) * p.driftAmp;

      // Loop when reaching top
      if (posAttr.array[i * 3 + 1] > 3.0) {
        posAttr.array[i * 3 + 1] = -2.2;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[sim.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[sim.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sim.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 5 : 7}
        map={sparkTexture}
        vertexColors
        transparent
        opacity={0.55} // 40 to 70% range
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
