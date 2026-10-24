import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const WHITE_COLOR = 0xF5F5F2;

/**
 * Deep orange particle palette:
 * Base: #E8590C (primary warm deep orange)
 * Range: #D9480F (deeper rich orange) to #F76707 (bright vibrant orange)
 * No yellow, cream, or gold tones.
 */
export const ORANGE_PARTICLE_PALETTE = [
  { color: 0xE8590C, emissive: 0xD9480F, hex: '#E8590C' }, // base warm deep orange
  { color: 0xD9480F, emissive: 0xC23B08, hex: '#D9480F' }, // deeper rich burnt orange
  { color: 0xF76707, emissive: 0xE8590C, hex: '#F76707' }, // bright vibrant orange
  { color: 0xEB6318, emissive: 0xD9480F, hex: '#EB6318' }, // medium-bright orange
  { color: 0xDE520A, emissive: 0xC23B08, hex: '#DE520A' }, // saturated deep orange
];

const VULCAN_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 230" fill="none">
  <g id="left-brace" fill="#F5F5F2">
    <path d="M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z"/>
  </g>
  <g id="v-mark" fill="#F5F5F2">
    <path d="M116 34.516v14.517l5.05 12.233c2.777 6.729 7.475 18.084 10.441 25.234 2.965 7.15 7.687 18.625 10.492 25.5 2.805 6.875 5.513 13.4 6.018 14.5.505 1.1 3.891 9.2 7.524 18 12.931 31.318 17.812 43.099 20.924 50.5l3.154 7.5 24.165.268 24.166.267 1.898-4.267c1.044-2.348 2.712-6.518 3.705-9.268.994-2.75 2.102-5.45 2.463-6 .361-.55 1.465-3.25 2.455-6 .989-2.75 2.386-6.35 3.105-8 .718-1.65 2.927-7.05 4.908-12.0 1.981-4.95 4.02-9.9 4.532-11 .512-1.1 2.551-6.05 4.532-11 3.401-8.497 5.446-13.408 7.496-18 .491-1.1 3.382-8.192 6.424-15.76 8.021-19.954 10.502-25.968 11.726-28.423l1.088-2.182-.616-1.604-.615-1.604-9.768.287-9.767.286-.5 14.5-.5 14.5-6.205.297-6.206.296-.294 6.704-.295 6.703-6.5.5-6.5.5-.5 7-.5 7-14.616.276-14.615.276-2.265-5.276c-1.246-2.902-3.498-7.976-5.004-11.276-8.889-19.48-22.504-52.557-32.105-78-1.66-4.4-3.431-9.012-3.935-10.25L160.043 20h-22.022H116v14.516Z"/>
  </g>
  <g id="right-brace" transform="translate(408 0) scale(-1 1)" fill="#F5F5F2">
    <path d="M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z"/>
  </g>
</svg>`;

/**
 * Measured gold pixels from /assets/vulcan-logo.png
 * Expressed in centered coordinates matching the SVG origin
 */
const MEASURED_GOLD_PIXELS = [
  { x: 49.0, y: 66.5, size: 12.0 },
  { x: 22.5, y: 51.5, size: 12.0 },
  { x: 35.0, y: 22.0, size: 12.0 },
  { x: 21.5, y: 7.5, size: 11.0 },
  { x: 15.5, y: 51.5, size: 9.0 },
  { x: 27.5, y: 7.0, size: 10.0 },
  { x: 15.5, y: 9.0, size: 7.0 },
];

export default function LogoMark3DV2({
  mousePosition = { x: 0, y: 0 },
  isMobile = false,
  frozen = false,
  prefersReducedMotion = false,
  scaleOverride = null,
}) {
  const groupRef = useRef();
  const particlesGroupRef = useRef();

  // 1. Synchronously parse SVG into clean Three.js ExtrudeGeometry
  const { geometries, materials } = useMemo(() => {
    const loader = new SVGLoader();
    const data = loader.parse(VULCAN_SVG_STRING);

    // Thin slab settings: depth is 6.5% of V height (~12 units), bevel 1.5 units
    const extrudeSettings = {
      depth: 12.0,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 1.5,
      bevelThickness: 1.5,
      curveSegments: 24,
    };

    const geoms = [];
    const mats = [];

    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geoms.push(geo);
        mats.push(
          new THREE.MeshStandardMaterial({
            color: WHITE_COLOR,
            roughness: 0.38,
            metalness: 0.0,
          })
        );
      });
    });

    // Compute united bounding box across all 3 shapes
    const bounds = new THREE.Box3();
    geoms.forEach((g) => {
      g.computeBoundingBox();
      bounds.union(g.boundingBox);
    });

    const center = bounds.getCenter(new THREE.Vector3());

    // Center each geometry and invert Y so upright (SVG Y points down, Three.js points up)
    geoms.forEach((g) => {
      g.translate(-center.x, -center.y, -center.z);
      g.scale(1, -1, 1);
      g.computeVertexNormals();
    });

    return { geometries: geoms, materials: mats };
  }, []);

  // 2. Measured static pixel meshes (for frozen preview or reduced motion)
  const staticGoldMeshes = useMemo(() => {
    return MEASURED_GOLD_PIXELS.map((p, idx) => {
      const geo = new THREE.BoxGeometry(p.size, p.size, 1.8);
      const palette = ORANGE_PARTICLE_PALETTE[idx % ORANGE_PARTICLE_PALETTE.length];
      const mat = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: 0.9,
        roughness: 0.28,
        metalness: 0.05,
        blending: THREE.NormalBlending,
        transparent: false,
        opacity: 1.0,
      });
      return { id: idx, geo, material: mat, x: p.x, y: p.y, z: 6.5 + idx * 0.25, size: p.size };
    });
  }, []);

  // Dynamic stream particles (9 pixels breaking off stepped bite with anti-overlap offsets)
  const dynamicPixels = useMemo(() => {
    const stream = [];
    for (let i = 0; i < 9; i++) {
      const base = MEASURED_GOLD_PIXELS[i % MEASURED_GOLD_PIXELS.length];
      const palette = ORANGE_PARTICLE_PALETTE[i % ORANGE_PARTICLE_PALETTE.length];

      // Anti-overlap: minimum spatial separation and distinct depth planes
      const spatialOffsetX = ((i % 3) - 1) * 2.8;
      const spatialOffsetY = (((i + 1) % 3) - 1) * 2.0;
      const baseZ = 6.2 + i * 0.35;

      const mat = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: 0.9,
        roughness: 0.28,
        metalness: 0.05,
        blending: THREE.NormalBlending,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });

      stream.push({
        id: i,
        baseX: base.x + spatialOffsetX,
        baseY: base.y + spatialOffsetY,
        baseZ,
        size: base.size * (0.85 + (i % 3) * 0.12),
        offsetTime: i * 0.42,
        speedX: 6.5 + (i % 3) * 4.0,
        speedY: 10.0 + (i % 4) * 3.5,
        geo: new THREE.BoxGeometry(base.size, base.size, 1.8),
        material: mat,
        palette,
      });
    }
    return stream;
  }, []);

  // 3. Clean disposal on unmount
  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      staticGoldMeshes.forEach((m) => {
        m.geo.dispose();
        m.material.dispose();
      });
      dynamicPixels.forEach((p) => {
        p.geo.dispose();
        p.material.dispose();
      });
    };
  }, [geometries, materials, staticGoldMeshes, dynamicPixels]);

  // 4. Subtle physical damping & parallax tilt (max 8 deg on each axis)
  useFrame((state, delta) => {
    if (!groupRef.current || frozen) return;

    const time = state.clock.elapsedTime;

    // Limit tilt to 8 degrees (~0.14 rad) with smooth damping
    const maxTiltX = 0.14;
    const maxTiltY = 0.14;

    const targetRotX = THREE.MathUtils.clamp(mousePosition.y * 0.14, -maxTiltX, maxTiltX) + Math.sin(time * 0.7) * 0.018;
    const targetRotY = THREE.MathUtils.clamp(mousePosition.x * 0.14, -maxTiltY, maxTiltY) + Math.cos(time * 0.5) * 0.022;
    const targetPosY = Math.sin(time * 1.1) * 0.04;

    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 3, delta);

    // Live drift of orange pixels (scale-shrink fading to zero, no opacity fade)
    if (particlesGroupRef.current && !prefersReducedMotion) {
      const children = particlesGroupRef.current.children;
      dynamicPixels.forEach((p, idx) => {
        const mesh = children[idx];
        if (!mesh) return;

        const cycle = 2.4; // 2.4 seconds loop
        const t = (time + p.offsetTime) % cycle;
        const progress = t / cycle;

        // Break off stepped bite and drift up-right with distinct depth
        const curX = p.baseX + progress * p.speedX + (mousePosition.x * 3);
        const curY = p.baseY + progress * p.speedY + (mousePosition.y * 3);
        const curZ = p.baseZ + progress * 2.2;

        mesh.position.set(curX, curY, curZ);
        mesh.rotation.z = Math.sin(time + idx) * 0.05;

        // Fading: shrink scale to zero over last 28% of life, slight emissive reduction.
        // Keep opacity = 1.0 and transparent = false to eliminate dark see-through look.
        const birthScale = progress < 0.10 ? Math.sin((progress / 0.10) * Math.PI * 0.5) : 1.0;
        const exitProgress = progress > 0.72 ? (progress - 0.72) / 0.28 : 0.0;
        const exitScale = progress > 0.72 ? Math.max(0, 1.0 - Math.pow(exitProgress, 1.8)) : 1.0;
        const currentScale = birthScale * exitScale;

        mesh.scale.set(currentScale, currentScale, currentScale);

        // Modest emissive reduction during exit so it stays rich without snapping
        if (p.material) {
          p.material.emissiveIntensity = 0.9 * (1.0 - exitProgress * 0.35);
          p.material.opacity = 1.0;
          p.material.transparent = false;
        }

        mesh.visible = currentScale > 0.005;
      });
    }
  });

  const baseScale = scaleOverride !== null ? scaleOverride : (isMobile ? 0.011 : 0.0153);

  return (
    <group ref={groupRef} scale={baseScale}>
      {/* 3D Extruded White Logo Shapes */}
      {geometries.map((geometry, index) => (
        <mesh
          key={geometry.uuid || index}
          geometry={geometry}
          material={materials[index]}
          castShadow
          receiveShadow
        />
      ))}

      {/* 3. Deep Orange Pixels (static during assembly/reduced-motion, dynamic during live hero) */}
      {frozen || prefersReducedMotion ? (
        <group>
          {staticGoldMeshes.map((p) => (
            <mesh
              key={p.id}
              geometry={p.geo}
              material={p.material}
              position={[p.x, p.y, p.z]}
            />
          ))}
        </group>
      ) : (
        <group ref={particlesGroupRef}>
          {dynamicPixels.map((p) => (
            <mesh
              key={p.id}
              geometry={p.geo}
              material={p.material}
              position={[p.baseX, p.baseY, p.baseZ]}
            />
          ))}
        </group>
      )}
    </group>
  );
}
