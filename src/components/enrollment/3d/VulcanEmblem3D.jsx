import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// Clean 3-path SVG with explicit fill attributes so SVGLoader parses solid shapes:
// 1. Left chevron (<)
// 2. Thin V (two clean diagonal strokes meeting at bottom, hollow open center - NOT a block)
// 3. Right chevron (>)
const VULCAN_CLEAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 230">
  <path id="left-chevron" fill="#F97316" d="M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z"/>
  <path id="thin-v" fill="#F97316" d="M136 20 L204 188 L272 20 L252 20 L204 144 L156 20 Z"/>
  <path id="right-chevron" fill="#F97316" transform="translate(408 0) scale(-1 1)" d="M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z"/>
</svg>`;

export default function VulcanEmblem3D({
  sceneState = 'intro',
  prefersReducedMotion = false,
  mousePosition = { x: 0, y: 0 },
  isMobile = false,
}) {
  const groupRef = useRef();
  const sweepLightRef = useRef();
  const [revealProgress, setRevealProgress] = useState(0);

  // Target world height: ~1.75 units (~55% canvas height in right section)
  const RAW_HEIGHT = 168.0;
  const TARGET_HEIGHT = 1.75;
  const S = TARGET_HEIGHT / RAW_HEIGHT;

  // Extrusion parameters:
  // depth: 0.15 (thin, not chunky)
  // bevelEnabled: true
  // bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 32
  const { geometries, material } = useMemo(() => {
    const loader = new SVGLoader();
    const data = loader.parse(VULCAN_CLEAN_SVG);

    const depthRaw = 0.15 / S;
    const bevelSizeRaw = 0.015 / S;
    const bevelThicknessRaw = 0.015 / S;

    const extrudeSettings = {
      depth: depthRaw,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: bevelSizeRaw,
      bevelThickness: bevelThicknessRaw,
      curveSegments: 32,
    };

    const geoms = [];

    data.paths.forEach((path) => {
      const shapes = typeof path.toShapes === 'function' ? path.toShapes(true) : SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geoms.push(geo);
      });
    });

    // Center using bounding box of the three shapes only
    const bounds = new THREE.Box3();
    geoms.forEach((g) => {
      g.computeBoundingBox();
      bounds.union(g.boundingBox);
    });

    const center = new THREE.Vector3();
    bounds.getCenter(center);

    // Center, flip inverted SVG Y-axis, and scale
    geoms.forEach((g) => {
      g.translate(-center.x, -center.y, -center.z);
      g.scale(S, -S, S);
      g.computeVertexNormals();
    });

    // Exact requested material:
    // MeshStandardMaterial, metalness 0.7, roughness 0.3, color #F97316, emissive #7C2D12, emissiveIntensity 0.35, no transparency
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F97316'),
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color('#7C2D12'),
      emissiveIntensity: 0.35,
      transparent: false,
    });

    return { geometries: geoms, material: mat };
  }, [S]);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  // Soft reveal animation on mount: scale 0.8 -> 1 with edge light sweep
  useEffect(() => {
    let frameId;
    const startTime = performance.now();
    const duration = 1200; // ms

    const animateReveal = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setRevealProgress(eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animateReveal);
      }
    };

    frameId = requestAnimationFrame(animateReveal);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    const isIntro = sceneState === 'intro';
    const isSubmitting = sceneState === 'submitting';
    const isSuccess = sceneState === 'success';

    let targetX = 0;
    let targetY = 0.12;
    let targetZ = 0;
    let targetScale = 0.85;

    if (isIntro) {
      if (isMobile) {
        targetX = 0;
        targetY = 1.35; // Top 35vh
        targetZ = 0.4;
        targetScale = 0.65;
      } else {
        targetX = 1.85; // Right ~45% composition
        targetY = 0.12;
        targetZ = 0.2;
        targetScale = 0.85;
      }
    } else if (sceneState === 'form') {
      targetX = 0;
      targetY = isMobile ? 1.85 : 1.55;
      targetZ = -1.6;
      targetScale = 0.52;
    } else if (isSubmitting) {
      targetX = 0;
      targetY = 1.4;
      targetZ = -1.0;
      targetScale = 0.65;
    } else if (isSuccess) {
      targetX = 0;
      targetY = 0.85;
      targetZ = -0.3;
      targetScale = 0.95;
    }

    // Gentle float (8s cycle)
    if (!prefersReducedMotion) {
      targetY += Math.sin(t * 0.78) * 0.03;
    }

    const lerpSpeed = Math.min(1.0, 4.0 * delta);
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * lerpSpeed;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * lerpSpeed;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * lerpSpeed;

    // Scale from 0.8 to 1 on initial reveal combined with targetScale
    const baseRevealScale = 0.8 + 0.2 * revealProgress;
    const currentScale = targetScale * baseRevealScale;
    const curX = groupRef.current.scale.x;
    const nextScale = curX + (currentScale - curX) * lerpSpeed;
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Slow rotation limited to +/- 20 degrees (0.349 rad)
    // Parallax tilt max ~6 degrees (0.10 rad)
    if (!prefersReducedMotion) {
      const maxRotY = 0.349; // 20 degrees in radians
      const maxTilt = 0.104; // 6 degrees in radians

      if (isIntro) {
        const baseRotY = Math.sin(t * 0.38) * 0.22;
        const parallaxY = THREE.MathUtils.clamp(mousePosition.x * 0.12, -maxTilt, maxTilt);
        const targetRotY = THREE.MathUtils.clamp(baseRotY + parallaxY, -maxRotY, maxRotY);
        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);

        const targetRotX = THREE.MathUtils.clamp(-mousePosition.y * 0.08, -maxTilt, maxTilt) + Math.sin(t * 0.6) * 0.012;
        groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
      } else if (isSubmitting) {
        groupRef.current.rotation.y += Math.sin(t * 22) * 0.02;
      } else {
        const baseRotY = Math.sin(t * 0.35) * 0.05;
        groupRef.current.rotation.y += (baseRotY - groupRef.current.rotation.y) * lerpSpeed;
      }
    }

    // Edge-light sweep across the logo during reveal
    if (sweepLightRef.current) {
      if (revealProgress < 1) {
        sweepLightRef.current.position.x = -3.0 + revealProgress * 6.0;
        sweepLightRef.current.intensity = Math.sin(revealProgress * Math.PI) * 2.5;
      } else {
        sweepLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 1.85, isMobile ? 1.35 : 0.12, 0]}>
      {/* 3D Extruded Clean Vulcan Logo Mark (3 Separate Shapes: <, thin V, >) */}
      <group>
        {geometries.map((geo, idx) => (
          <mesh
            key={idx}
            geometry={geo}
            material={material}
            castShadow
            receiveShadow
          />
        ))}
      </group>

      {/* 1. Warm key light from front-left (#FDBA74, intensity 1.5) */}
      <directionalLight
        position={[-3.2, 2.2, 3.8]}
        color="#FDBA74"
        intensity={1.5}
      />

      {/* 2. Strong orange rim light from behind-right (#FF5500, intensity 2.2) */}
      <directionalLight
        position={[2.5, 1.2, -3.0]}
        color="#FF5500"
        intensity={2.2}
      />

      {/* 3. Very dim fill (#3D1308, intensity 0.3) */}
      <directionalLight
        position={[0, -2.0, 2.0]}
        color="#3D1308"
        intensity={0.3}
      />

      {/* Sweep light for initial edge-glint reveal */}
      <pointLight
        ref={sweepLightRef}
        position={[-3, 0.5, 1.5]}
        color="#FFF4E0"
        intensity={0}
        distance={4.5}
      />

      {/* 2 to 3 faint volumetric light beams angling down onto the logo (~6% opacity) */}
      <group position={[0, 1.8, -0.2]} rotation={[0, 0, -0.22]}>
        <mesh position={[-0.4, 0, 0]}>
          <planeGeometry args={[0.35, 3.8]} />
          <meshBasicMaterial
            color="#C2410C"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0.3, 0, 0.1]}>
          <planeGeometry args={[0.28, 4.0]} />
          <meshBasicMaterial
            color="#EA580C"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
