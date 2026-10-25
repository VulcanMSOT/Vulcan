import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Helper to sample equidistant points along a line segment
 */
function sampleSegment(p1, p2, count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    pts.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });
  }
  return pts;
}

/**
 * Generates the official Vulcan {V} 3D particle target points.
 * Traced with geometric precision:
 * - Left brace { and right brace } from official centerline paths in About.jsx
 * - Central V defined as a clean, symmetrical, solid bold font V
 * - Separated into braces and V groups for vibrant theme-orange material styling
 */
function generateVulcanEmblemPoints() {
  // Left Brace: 10 segments tracing official SVG path
  // SVG: (100,9)->(50,9)->(50,55)->(40,55)->(40,95)->(11,145)->(40,195)->(40,235)->(50,235)->(50,281)->(100,281)
  const lbSegments = [
    { seg: [{ x: -1.32, y: 1.10 }, { x: -1.82, y: 1.10 }], count: 6 }, // Top hook
    { seg: [{ x: -1.82, y: 1.10 }, { x: -1.82, y: 0.74 }], count: 5 }, // Step down
    { seg: [{ x: -1.82, y: 0.74 }, { x: -1.94, y: 0.74 }], count: 2 }, // Inset step
    { seg: [{ x: -1.94, y: 0.74 }, { x: -1.94, y: 0.40 }], count: 5 }, // Upper stem
    { seg: [{ x: -1.94, y: 0.40 }, { x: -2.26, y: 0.00 }], count: 7 }, // Cusp out
    { seg: [{ x: -2.26, y: 0.00 }, { x: -1.94, y: -0.40 }], count: 7 }, // Cusp in
    { seg: [{ x: -1.94, y: -0.40 }, { x: -1.94, y: -0.74 }], count: 5 }, // Lower stem
    { seg: [{ x: -1.94, y: -0.74 }, { x: -1.82, y: -0.74 }], count: 2 }, // Outset step
    { seg: [{ x: -1.82, y: -0.74 }, { x: -1.82, y: -1.10 }], count: 5 }, // Step down
    { seg: [{ x: -1.82, y: -1.10 }, { x: -1.32, y: -1.10 }], count: 6 }, // Bottom hook
  ];

  let leftBrace = [];
  lbSegments.forEach(({ seg, count }) => {
    const pts = sampleSegment(seg[0], seg[1], count);
    if (leftBrace.length > 0) pts.shift(); // Deduplicate corner vertices
    leftBrace.push(...pts);
  });

  // Right Brace: Exact horizontal reflection
  const rightBrace = leftBrace.map((p) => ({ x: -p.x, y: p.y }));

  // Central V: Clean, symmetrical, bold font V
  // Left arm (outer + inner double track for bold weight, plus top cap)
  const vLeftOuter = sampleSegment({ x: -0.64, y: 1.10 }, { x: 0.00, y: -1.10 }, 16);
  const vLeftInner = sampleSegment({ x: -0.46, y: 1.10 }, { x: 0.00, y: -0.76 }, 14);
  const vLeftCap = sampleSegment({ x: -0.64, y: 1.10 }, { x: -0.46, y: 1.10 }, 3);

  // Right arm (outer + inner double track for bold weight, plus top cap)
  const vRightOuter = sampleSegment({ x: 0.64, y: 1.10 }, { x: 0.00, y: -1.10 }, 16);
  const vRightInner = sampleSegment({ x: 0.46, y: 1.10 }, { x: 0.00, y: -0.76 }, 14);
  const vRightCap = sampleSegment({ x: 0.46, y: 1.10 }, { x: 0.64, y: 1.10 }, 3);

  // Solid apex junction at bottom
  const apex = [
    { x: -0.05, y: -1.04 },
    { x: 0.00, y: -1.10 },
    { x: 0.05, y: -1.04 },
  ];

  return {
    braces: [...leftBrace, ...rightBrace],
    v: [
      ...vLeftCap,
      ...vLeftOuter,
      ...vLeftInner,
      ...apex,
      ...vRightInner,
      ...vRightOuter,
      ...vRightCap,
    ],
  };
}

function ConvergingPixels({ progress }) {
  const braceMeshRef = useRef();
  const vMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute points with deterministic 3D dispersal & vortex dynamics
  const { braceParticles, vParticles } = useMemo(() => {
    const { braces, v } = generateVulcanEmblemPoints();

    const buildParticleGroup = (pts, isBraceGroup) =>
      pts.map((pt, i) => {
        // Dispersed 3D coordinates using golden-ratio distribution
        const goldenAngle = (i * 137.5 * Math.PI) / 180;
        const radius = 3.6 + ((i * 29) % 23) * 0.12;
        const elevation = ((((i * 67) % 19) - 9) / 9) * 0.9;

        const startX = Math.cos(goldenAngle) * Math.cos(elevation) * radius;
        const startY = Math.sin(goldenAngle) * Math.cos(elevation) * radius * 0.85;
        const startZ = Math.sin(elevation) * radius * 0.9 + (((i % 5) - 2) * 0.4);

        // Stagger threshold: Braces assemble first, V body settles in rhythm
        const staggerBase = isBraceGroup ? 0.00 : 0.04;
        const stagger = staggerBase + ((i % 8) * 0.015);

        // Vortex swirl direction and speed
        const swirlDir = i % 2 === 0 ? 1 : -1;
        const swirlSpeed = swirlDir * (1.1 + (i % 5) * 0.2);

        // Parabolic z-depth arc during flight
        const zArcStrength = (((i % 7) - 3) * 0.28) + 0.35;

        // Random spin angular velocities for dispersed tumbling
        const spinX = 0.8 + ((i % 4) * 0.4);
        const spinY = 1.0 + ((i % 5) * 0.3);
        const spinZ = 0.6 + ((i % 3) * 0.5);

        return {
          id: i,
          startX,
          startY,
          startZ,
          targetX: pt.x,
          targetY: pt.y,
          targetZ: 0,
          size: isBraceGroup ? 0.074 : 0.076,
          stagger,
          swirlSpeed,
          zArcStrength,
          spinX,
          spinY,
          spinZ,
        };
      });

    return {
      braceParticles: buildParticleGroup(braces, true),
      vParticles: buildParticleGroup(v, false),
    };
  }, []);

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  // Vulcan Gold / Amber Material for the Braces { } (#F5A623)
  const braceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xF5A623,
        emissive: 0xB84800,
        emissiveIntensity: 1.15,
        roughness: 0.18,
        metalness: 0.72,
      }),
    []
  );

  // Vibrant Website Theme Orange Material for Central V (#E8590C)
  const vMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xE8590C,
        emissive: 0xD9480F,
        emissiveIntensity: 1.85,
        roughness: 0.15,
        metalness: 0.80,
      }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const globalT = THREE.MathUtils.clamp(progress, 0, 1);

    const updateMesh = (meshRef, particles) => {
      if (!meshRef.current) return;

      particles.forEach((p, i) => {
        // Individual staggered progress
        const localT = THREE.MathUtils.clamp((globalT - p.stagger) / (1 - p.stagger), 0, 1);

        // Cubic-bezier ease out with magnetic snap
        const ease = 1 - Math.pow(1 - localT, 3.2);

        // Dynamic vortex / spiral tangential swirl that smoothly decays to 0 at ease=1
        const swirlAngle = (1 - ease) * p.swirlSpeed * Math.PI * 0.75;
        const swirlFactor = Math.sin((1 - ease) * Math.PI * 0.5);
        const cosSwirl = Math.cos(swirlAngle * swirlFactor);
        const sinSwirl = Math.sin(swirlAngle * swirlFactor);

        // Lerp base trajectory
        const lerpX = THREE.MathUtils.lerp(p.startX, p.targetX, ease);
        const lerpY = THREE.MathUtils.lerp(p.startY, p.targetY, ease);

        // Apply swirling orbital curve
        const curX = lerpX * cosSwirl - lerpY * sinSwirl;
        const curY = lerpX * sinSwirl + lerpY * cosSwirl;

        // Depth swoop along Z arc
        const zArc = Math.sin(localT * Math.PI) * p.zArcStrength;
        const curZ = THREE.MathUtils.lerp(p.startZ, p.targetZ, ease) + zArc;

        // Micro-idle motion once converged (localT > 0.85)
        const idleWeight = Math.max(0, (localT - 0.85) / 0.15);
        let finalX = curX;
        let finalY = curY;
        let finalZ = curZ;

        // Subtly breathing collective levitation
        finalY += Math.sin(time * 1.6 + p.targetX * 0.8) * 0.018 * idleWeight;
        finalX += Math.cos(time * 1.3 + p.targetY * 0.8) * 0.010 * idleWeight;
        finalZ += Math.sin(time * 2.0 + p.id * 0.4) * 0.015 * idleWeight;

        dummy.position.set(finalX, finalY, finalZ);
        dummy.scale.setScalar(p.size);

        // Rotational tumbling in dispersed state, snapping cleanly to grid upon convergence
        const rotDecay = 1 - ease;
        dummy.rotation.x = time * p.spinX * rotDecay;
        dummy.rotation.y = time * p.spinY * rotDecay;
        dummy.rotation.z = time * p.spinZ * rotDecay;

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(braceMeshRef, braceParticles);
    updateMesh(vMeshRef, vParticles);
  });

  return (
    <group>
      {/* Outer Braces { } in Warm Amber Vulcan Gold */}
      <instancedMesh
        ref={braceMeshRef}
        args={[cubeGeo, braceMat, braceParticles.length]}
      />
      {/* Central V in Vibrant Theme Orange */}
      <instancedMesh
        ref={vMeshRef}
        args={[cubeGeo, vMat, vParticles.length]}
      />
    </group>
  );
}

export default function ClosingCanvas({ progress, prefersReducedMotion }) {
  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center font-mono text-4xl text-[#F5A623] select-none drop-shadow-[0_0_24px_rgba(255,122,26,0.4)]">
        &#123; <span className="text-[#FF7A1A] font-bold mx-2 drop-shadow-[0_0_18px_rgba(255,122,26,0.85)]">V</span> &#125;
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 42 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Dark-mode warm ambient fill */}
        <ambientLight intensity={0.7} color="#1c120a" />

        {/* Crisp specular key light */}
        <directionalLight position={[4, 5, 4]} intensity={2.2} color="#fff4e6" />

        {/* Subtle electric rim light for edge separation against dark backgrounds */}
        <directionalLight position={[-5, -4, -3]} intensity={1.1} color="#38bdf8" />

        {/* Central vibrant theme-orange point light radiating from the V */}
        <pointLight position={[0, 0, 2.0]} intensity={4.5} color="#E8590C" distance={8} />

        {/* Secondary warm gold point light at base */}
        <pointLight position={[0, -0.9, 1.4]} intensity={2.6} color="#F5A623" distance={6} />
        <ConvergingPixels progress={progress} />
      </Canvas>
    </div>
  );
}
