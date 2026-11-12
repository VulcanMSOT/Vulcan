import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({
  sceneState = 'intro', // 'intro' | 'form' | 'submitting' | 'success'
  step = 1,
  mousePosition = { x: 0, y: 0 },
  prefersReducedMotion = false,
  isMobile = false,
}) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.2, isMobile ? 8.2 : 6.8));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.1, 0));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    // Compute target coordinates based on scene state
    if (sceneState === 'intro') {
      const zDist = isMobile ? 8.0 : 6.8;
      const yPos = isMobile ? 0.35 : 0.1;
      targetPos.set(0, yPos, zDist);
      targetLookAt.set(0, yPos, 0);

      // Controlled subtle Mouse Parallax in Intro
      if (!prefersReducedMotion) {
        targetPos.x += mousePosition.x * 0.22;
        targetPos.y += -mousePosition.y * 0.15;
      }
    } else if (sceneState === 'form') {
      // Step-specific camera adjustments
      const zBase = isMobile ? 7.6 : 5.8;
      if (step === 1) {
        targetPos.set(0, 0.1, zBase);
        targetLookAt.set(0, 0.05, 0);
      } else if (step === 2) {
        targetPos.set(isMobile ? 0 : 0.25, 0.15, zBase - 0.2);
        targetLookAt.set(0, 0.05, 0);
      } else if (step === 3) {
        targetPos.set(isMobile ? 0 : -0.2, 0.05, zBase);
        targetLookAt.set(0, 0.0, 0);
      } else {
        // Review step
        targetPos.set(0, 0.1, zBase + 0.2);
        targetLookAt.set(0, 0.05, 0);
      }

      if (!prefersReducedMotion) {
        targetPos.x += mousePosition.x * 0.18;
        targetPos.y += -mousePosition.y * 0.14;
      }
    } else if (sceneState === 'submitting') {
      // Shaking hammer impact vibration
      targetPos.set(0, 0.15, isMobile ? 7.2 : 5.4);
      targetLookAt.set(0, 0.1, 0);
      if (!prefersReducedMotion) {
        targetPos.x += (Math.random() - 0.5) * 0.06;
        targetPos.y += (Math.random() - 0.5) * 0.06;
      }
    } else if (sceneState === 'success') {
      // Open majestic vista
      targetPos.set(0, 0.5, isMobile ? 8.6 : 7.2);
      targetLookAt.set(0, 0.3, 0);
      if (!prefersReducedMotion) {
        targetPos.x += Math.sin(t * 0.35) * 0.3;
      }
    }

    // Smooth physical lerp
    const lerpRate = prefersReducedMotion ? 1.0 : Math.min(1.0, 3.8 * delta);
    currentPos.current.lerp(targetPos, lerpRate);
    currentLookAt.current.lerp(targetLookAt, lerpRate);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

