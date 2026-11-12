import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import VulcanEmblem3D from './VulcanEmblem3D';
import MoltenForgeCore from './MoltenForgeCore';
import EmberParticles from './EmberParticles';
import CameraController from './CameraController';

export default function ForgeCanvas({
  sceneState = 'intro',
  step = 1,
  prefersReducedMotion = false,
  mousePosition = { x: 0, y: 0 },
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chromaticOffset = useMemo(
    () => new THREE.Vector2(0.0005, 0.0005),
    []
  );

  return (
    <div className="fixed inset-0 z-10 w-full h-full pointer-events-none select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.2, isMobile ? 8.4 : 6.8], fov: 46, near: 0.1, far: 50 }}
        dpr={isMobile ? [1, 1.25] : [1, 2]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={null}>
          {/* Deep dark obsidian & subtle warm ember ambient lighting */}
          <ambientLight intensity={0.15} color="#1A0A04" />

          {/* In-Memory Reflection Studio (Zero external network calls, gorgeous metallic highlights) */}
          <Environment resolution={256} frames={1}>
            {/* Overhead key lightformer */}
            <Lightformer
              form="rect"
              intensity={2.8}
              position={[3.0, 4.5, 2.5]}
              scale={[6, 3, 1]}
              color="#FDBA74"
            />
            {/* Behind-right hot rim lightformer */}
            <Lightformer
              form="rect"
              intensity={3.8}
              position={[-3.0, 2.0, -3.5]}
              scale={[5, 4, 1]}
              color="#FF5500"
            />
            {/* Floor warm ember bounce */}
            <Lightformer
              form="circle"
              intensity={1.2}
              position={[0, -3.0, 1.5]}
              scale={[5, 5, 1]}
              color="#7C2D12"
            />
          </Environment>

          {/* Camera Controller & Scene Transitions */}
          <CameraController
            sceneState={sceneState}
            step={step}
            mousePosition={mousePosition}
            prefersReducedMotion={prefersReducedMotion}
            isMobile={isMobile}
          />

          {/* Hero 3D Vulcan Emblem (< V > thin geometry, product lighting, light shafts) */}
          <VulcanEmblem3D
            sceneState={sceneState}
            prefersReducedMotion={prefersReducedMotion}
            mousePosition={mousePosition}
            isMobile={isMobile}
          />

          {/* Glossy Reflective Floor, Glowing Floor Ring & Faint Grid Lines */}
          <MoltenForgeCore
            sceneState={sceneState}
            prefersReducedMotion={prefersReducedMotion}
            isMobile={isMobile}
          />

          {/* Sparse & Fine Quiet Ember Particles (40-60 desktop, 20 mobile) */}
          <EmberParticles
            count={isMobile ? 20 : 50}
            isMobile={isMobile}
            sceneState={sceneState}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* Post-Processing Pipeline: Subtle Bloom, Light Vignette & Chromatic Aberration */}
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.1}
              mipmapBlur
            />
            <Vignette
              offset={0.15}
              darkness={0.85}
              eskil={false}
            />
            {!isMobile && (
              <ChromaticAberration
                offset={chromaticOffset}
                radialModulation={false}
                modulationOffset={0}
              />
            )}
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
