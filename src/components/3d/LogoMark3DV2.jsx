import { useEffect, useMemo, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const WHITE = 0xF5F5F2;

/**
 * Replacement candidate for the legacy VulcanEmblem. It deliberately keeps the
 * same public props so HeroCanvas can change with one line after visual approval.
 */
export default function LogoMark3DV2({ mousePosition = { x: 0, y: 0 }, isMobile = false, frozen = false }) {
  const groupRef = useRef();
  const svg = useLoader(SVGLoader, '/assets/vulcan-mark-v2.svg');

  const { geometries, materials } = useMemo(() => {
    const settings = {
      depth: 14,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 1.25,
      bevelThickness: 1.25,
      curveSegments: 18,
    };
    const raw = svg.paths.flatMap((path) => SVGLoader.createShapes(path).map((shape) => new THREE.ExtrudeGeometry(shape, settings)));
    const bounds = new THREE.Box3();
    raw.forEach((geometry) => { geometry.computeBoundingBox(); bounds.union(geometry.boundingBox); });
    const center = bounds.getCenter(new THREE.Vector3());
    raw.forEach((geometry) => {
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.computeVertexNormals();
    });
    return {
      geometries: raw,
      materials: raw.map(() => new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.42, metalness: 0.02 })),
    };
  }, [svg]);

  useEffect(() => () => {
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }, [geometries, materials]);

  useFrame((state, delta) => {
    if (!groupRef.current || frozen) return;
    const targetRotX = (mousePosition.y * 0.16) + (Math.sin(state.clock.elapsedTime * 0.7) * 0.025);
    const targetRotY = (mousePosition.x * 0.25) + (Math.cos(state.clock.elapsedTime * 0.5) * 0.035);
    const targetPosY = Math.sin(state.clock.elapsedTime * 1.1) * 0.06;
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 3, delta);
  });

  return (
    <group ref={groupRef} scale={(isMobile ? 0.011 : 0.0153)}>
      {geometries.map((geometry, index) => <mesh key={geometry.uuid} geometry={geometry} material={materials[index]} castShadow receiveShadow />)}
    </group>
  );
}
