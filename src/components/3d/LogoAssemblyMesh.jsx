import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GRID_CELL_SIZE,
  DESKTOP_GRID_CELLS,
  MOBILE_GRID_CELLS,
  GOLD_GRID_CELLS,
} from './logoGridData';

// Strong custom ease-out with tiny settle (elastic overshoot)
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3.5);
}

/**
 * Instanced 3D Logo Assembly Mesh (single draw call for ~1200 squares)
 */
export default function LogoAssemblyMesh({
  progress = 0, // 0.0 to 1.0 assembly progress
  isMobile = false,
  fuseProgress = 0, // 0.0 to 1.0 (squares expand & fade out into solid mesh)
}) {
  const whiteMeshRef = useRef();
  const goldMeshRef = useRef();

  const cells = useMemo(() => {
    return isMobile ? MOBILE_GRID_CELLS : DESKTOP_GRID_CELLS;
  }, [isMobile]);

  const cellCount = cells.length;
  const goldCount = GOLD_GRID_CELLS.length;

  // Single shared geometry for flat squares
  const squareGeo = useMemo(() => {
    return new THREE.BoxGeometry(GRID_CELL_SIZE, GRID_CELL_SIZE, 0.4);
  }, []);

  // Crisp white material with soft glint
  const whiteMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xf5f5f2,
      roughness: 0.35,
      metalness: 0.05,
      transparent: true,
      opacity: 1.0,
    });
  }, []);

  // Deep orange material with warm emissive glow matching hero pixels
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xE8590C,
      emissive: 0xD9480F,
      emissiveIntensity: 0.85,
      roughness: 0.28,
      metalness: 0.05,
      transparent: true,
      opacity: 1.0,
    });
  }, []);

  // Reusable scratch objects for matrix calculations (ZERO per-frame GC allocations)
  const scratch = useMemo(() => {
    return {
      dummy: new THREE.Object3D(),
      color: new THREE.Color(),
      baseWhite: new THREE.Color(0xf5f5f2),
      pulseWhite: new THREE.Color(0xffffff),
    };
  }, []);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      squareGeo.dispose();
      whiteMaterial.dispose();
      goldMaterial.dispose();
    };
  }, [squareGeo, whiteMaterial, goldMaterial]);

  useFrame(() => {
    if (!whiteMeshRef.current) return;

    const curProgress = (typeof progress === 'object' && progress !== null && 'current' in progress)
      ? progress.current
      : progress;
    const curFuse = (typeof fuseProgress === 'object' && fuseProgress !== null && 'current' in fuseProgress)
      ? fuseProgress.current
      : fuseProgress;

    const { dummy, color, baseWhite, pulseWhite } = scratch;
    const mesh = whiteMeshRef.current;

    // Fade out squares during fuse
    whiteMaterial.opacity = Math.max(0, 1.0 - curFuse * 1.1);

    // Expand squares slightly during fuse to close cell gaps
    const fuseScale = 1.0 + curFuse * 0.08;

    for (let i = 0; i < cellCount; i++) {
      const [tx, ty, sx, sy, sz, stagger] = cells[i];

      // Normalized flight time for this cell
      // Sweep spans from 0.0 to 0.72; each cell takes 0.28 of the timeline
      const startT = stagger * 0.72;
      const duration = 0.28;
      const localP = THREE.MathUtils.clamp((curProgress - startT) / duration, 0, 1);
      const eased = easeOutCubic(localP);

      // Settle pulse when landing
      let scaleMult = fuseScale;
      let pulseGlow = 0;

      if (localP < 1.0 && localP > 0.8) {
        // Brightness pulse at moment of lock-in
        const pulseT = (localP - 0.8) / 0.2;
        pulseGlow = Math.sin(pulseT * Math.PI) * 0.45;
        scaleMult *= 1.0 + pulseGlow * 0.15;
      } else if (localP < 0.8) {
        // Start smaller while scattered in cloud
        scaleMult = 0.6 + eased * 0.4;
      }

      const curX = THREE.MathUtils.lerp(sx, tx, eased);
      const curY = THREE.MathUtils.lerp(sy, ty, eased);
      const curZ = THREE.MathUtils.lerp(sz, 0, eased);

      dummy.position.set(curX, curY, curZ);
      dummy.scale.set(scaleMult, scaleMult, 1.0);
      dummy.rotation.z = (1 - eased) * 0.6; // Soft settling spin
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);

      // Apply brightness pulse
      if (pulseGlow > 0.05) {
        color.copy(baseWhite).lerp(pulseWhite, pulseGlow);
        mesh.setColorAt(i, color);
      } else {
        mesh.setColorAt(i, baseWhite);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Update gold pixels
    if (goldMeshRef.current) {
      const gMesh = goldMeshRef.current;
      goldMaterial.opacity = Math.max(0, 1.0 - curFuse * 0.9);

      for (let j = 0; j < goldCount; j++) {
        const [tx, ty, sx, sy, sz, stagger, size] = GOLD_GRID_CELLS[j];
        const startT = stagger * 0.75;
        const duration = 0.25;
        const localP = THREE.MathUtils.clamp((curProgress - startT) / duration, 0, 1);
        const eased = easeOutCubic(localP);

        const curX = THREE.MathUtils.lerp(sx, tx, eased);
        const curY = THREE.MathUtils.lerp(sy, ty, eased);
        const curZ = THREE.MathUtils.lerp(sz, 2.0, eased);

        dummy.position.set(curX, curY, curZ);
        dummy.scale.set(size / GRID_CELL_SIZE, size / GRID_CELL_SIZE, 1.2);
        dummy.rotation.z = (1 - eased) * 0.3;
        dummy.updateMatrix();

        gMesh.setMatrixAt(j, dummy.matrix);
      }
      gMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. White Solid Mark Squares */}
      <instancedMesh
        ref={whiteMeshRef}
        args={[squareGeo, whiteMaterial, cellCount]}
        castShadow
        receiveShadow
      />

      {/* 2. Gold Squares (Stepped Bite Accent) */}
      <instancedMesh
        ref={goldMeshRef}
        args={[squareGeo, goldMaterial, goldCount]}
        castShadow
      />
    </group>
  );
}
