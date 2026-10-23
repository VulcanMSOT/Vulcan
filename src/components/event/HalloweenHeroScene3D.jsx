import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// -------------------------------------------------------------
// Procedural Pumpkin Geometry Generator
// Creates a ribbed, squashed pumpkin with indented top and bottom
// -------------------------------------------------------------
function createPumpkinGeometry(radius = 1.0, ribs = 10, radialSegments = 40, heightSegments = 32) {
  const geom = new THREE.SphereGeometry(radius, radialSegments, heightSegments);
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Calculate angle in XZ plane for ribbing
    const theta = Math.atan2(v.z, v.x);
    // 10 distinct lobes/ribs
    const ribFactor = 1.0 + 0.13 * Math.cos(theta * ribs);

    // Vertical squashing: height is ~75% of width
    v.y *= 0.74;

    // Top and bottom stem/navel indentation
    const normY = Math.abs(v.y / (radius * 0.74));
    const dentFactor = 1.0 - 0.28 * Math.pow(Math.min(1.0, normY), 3.2);

    // Subtle natural asymmetry
    const asymmetry = 1.0 + 0.04 * Math.sin(theta * 3.0 + v.y * 2.0);

    v.x *= ribFactor * dentFactor * asymmetry;
    v.z *= ribFactor * dentFactor * asymmetry;

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geom.computeVertexNormals();
  return geom;
}

// -------------------------------------------------------------
// Procedural Stem Geometry
// Curves upward and twists slightly from the stem indent
// -------------------------------------------------------------
function createStemGeometry() {
  const geom = new THREE.CylinderGeometry(0.065, 0.12, 0.52, 12, 10);
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Curve along the Y-axis
    const progress = (v.y + 0.26) / 0.52; // 0 to 1
    v.x += Math.pow(progress, 1.8) * 0.24;
    v.z += progress * 0.08;
    // Taper slightly toward the tip
    const taper = 1.0 - progress * 0.22;
    v.x *= taper;
    v.z *= taper;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geom.computeVertexNormals();
  return geom;
}

// -------------------------------------------------------------
// Carved Face Shapes (Eyes, Nose, Menacing Jagged Grin)
// Created as 2D shapes projected on the front surface of the pumpkin
// -------------------------------------------------------------
function createCarvedFaceShapes() {
  // Left eye triangle
  const leftEye = new THREE.Shape();
  leftEye.moveTo(-0.48, 0.16);
  leftEye.lineTo(-0.22, 0.28);
  leftEye.lineTo(-0.16, 0.08);
  leftEye.closePath();

  // Right eye triangle
  const rightEye = new THREE.Shape();
  rightEye.moveTo(0.16, 0.08);
  rightEye.lineTo(0.22, 0.28);
  rightEye.lineTo(0.48, 0.16);
  rightEye.closePath();

  // Carved nose
  const nose = new THREE.Shape();
  nose.moveTo(0.0, 0.08);
  nose.lineTo(0.1, -0.06);
  nose.lineTo(-0.1, -0.06);
  nose.closePath();

  // Jagged smile with teeth
  const mouth = new THREE.Shape();
  mouth.moveTo(-0.52, -0.16);
  mouth.lineTo(-0.36, -0.26);
  mouth.lineTo(-0.24, -0.18);
  mouth.lineTo(-0.14, -0.32);
  mouth.lineTo(0.0, -0.22);
  mouth.lineTo(0.14, -0.32);
  mouth.lineTo(0.24, -0.18);
  mouth.lineTo(0.36, -0.26);
  mouth.lineTo(0.52, -0.16);
  // Bottom jaw teeth
  mouth.lineTo(0.42, -0.36);
  mouth.lineTo(0.3, -0.42);
  mouth.lineTo(0.18, -0.34);
  mouth.lineTo(0.0, -0.46);
  mouth.lineTo(-0.18, -0.34);
  mouth.lineTo(-0.3, -0.42);
  mouth.lineTo(-0.42, -0.36);
  mouth.closePath();

  return [leftEye, rightEye, nose, mouth];
}

// -------------------------------------------------------------
// 3D Jack-O'-Lantern Component
// Ribbed mesh + carved glowing face + flickering interior candle
// -------------------------------------------------------------
function JackOLantern({ scrollProgress, cursor, reducedMotion, entryProgress }) {
  const pumpkinRef = useRef();
  const candleLightRef = useRef();
  const faceMeshRef = useRef();
  const { viewport } = useThree();

  const { pumpkinGeom, stemGeom, faceGeometries } = useMemo(() => {
    const pGeom = createPumpkinGeometry(1.28, 10, 48, 36);
    const sGeom = createStemGeometry();
    const shapes = createCarvedFaceShapes();
    const fGeoms = shapes.map((shape) => new THREE.ShapeGeometry(shape, 12));
    return { pumpkinGeom: pGeom, stemGeom: sGeom, faceGeometries: fGeoms };
  }, []);

  // Materials
  const pumpkinMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xe85d04,
      roughness: 0.46,
      metalness: 0.03,
      bumpScale: 0.08,
    });
  }, []);

  const stemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x242a17,
      roughness: 0.85,
      metalness: 0.02,
    });
  }, []);

  const glowFaceMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      side: THREE.DoubleSide,
    });
  }, []);

  // Animate candle flicker, parallax, and scroll dissolve
  useFrame((state, delta) => {
    if (!pumpkinRef.current) return;
    const time = state.clock.elapsedTime;
    const isMobile = viewport.width < 3.2;

    // Smooth organic candle flame flicker (no strobing, no flashing > 3Hz)
    if (candleLightRef.current && !reducedMotion) {
      const flicker =
        Math.sin(time * 3.4) * 0.18 +
        Math.sin(time * 6.2) * 0.12 +
        Math.cos(time * 1.7) * 0.14 +
        Math.sin(time * 9.1) * 0.06;
      const baseIntensity = 4.2 * entryProgress;
      candleLightRef.current.intensity = Math.max(1.0, baseIntensity + flicker * 1.4);

      // Subtle warm hue shift
      const hueShift = 0.085 + Math.sin(time * 2.1) * 0.015;
      candleLightRef.current.color.setHSL(hueShift, 0.96, 0.54);

      if (faceMeshRef.current) {
        faceMeshRef.current.children.forEach((mesh) => {
          mesh.material.color.setHSL(hueShift + 0.02, 1.0, 0.62 + flicker * 0.08);
        });
      }
    }

    if (reducedMotion) {
      if (candleLightRef.current) candleLightRef.current.intensity = 4.0;
      return;
    }

    // Parallax damping & mobile responsive positioning
    const targetRotY = cursor.x * 0.22 + Math.sin(time * 0.4) * 0.03;
    const targetRotX = -cursor.y * 0.15 + Math.cos(time * 0.5) * 0.02;
    // On desktop: position to the right (x = 1.78) so it leaves hero content completely unobstructed
    // On mobile: position slightly higher in upper-right background with gentle presence
    const targetPosX = isMobile ? 0.35 + cursor.x * 0.12 : 1.78 + cursor.x * 0.25;
    const targetPosY = isMobile ? 0.95 - scrollProgress * 2.8 : -0.15 - scrollProgress * 2.8 + cursor.y * 0.15;
    const targetPosZ = isMobile ? -0.2 : 0.05 - scrollProgress * 1.6;
    const targetScale = isMobile ? 0.62 : 0.92;

    pumpkinRef.current.rotation.y = THREE.MathUtils.damp(pumpkinRef.current.rotation.y, targetRotY, 3.5, delta);
    pumpkinRef.current.rotation.x = THREE.MathUtils.damp(pumpkinRef.current.rotation.x, targetRotX, 3.5, delta);
    pumpkinRef.current.position.x = THREE.MathUtils.damp(pumpkinRef.current.position.x, targetPosX, 3.5, delta);
    pumpkinRef.current.position.y = THREE.MathUtils.damp(pumpkinRef.current.position.y, targetPosY, 3.5, delta);
    pumpkinRef.current.position.z = THREE.MathUtils.damp(pumpkinRef.current.position.z, targetPosZ, 3.5, delta);
    pumpkinRef.current.scale.setScalar(THREE.MathUtils.damp(pumpkinRef.current.scale.x, targetScale, 3.5, delta));

    // Fade out pumpkin when scrolled down, and keep semi-transparent on mobile for readability
    const baseOpacity = isMobile ? 0.6 : 1.0;
    const opacity = Math.max(0.0, baseOpacity - scrollProgress * 1.5) * entryProgress;
    pumpkinMaterial.opacity = opacity;
    pumpkinMaterial.transparent = opacity < 0.99;
  });

  return (
    <group ref={pumpkinRef} position={[1.78, -0.15, 0.05]} scale={0.92}>
      {/* Pumpkin Body */}
      <mesh geometry={pumpkinGeom} material={pumpkinMaterial} castShadow receiveShadow />

      {/* Pumpkin Stem */}
      <mesh geometry={stemGeom} material={stemMaterial} position={[0, 0.95, 0]} castShadow />

      {/* Interior Point Light glowing outward through the face */}
      <pointLight
        ref={candleLightRef}
        color="#ff8c1a"
        intensity={4.2}
        distance={7.0}
        decay={2.0}
        position={[0, 0.05, 0.4]}
      />

      {/* Carved Glowing Face Elements positioned on front curvature */}
      <group ref={faceMeshRef} position={[0, -0.04, 1.25]} scale={1.02}>
        {faceGeometries.map((geom, idx) => (
          <mesh key={idx} geometry={geom} material={glowFaceMaterial} position={[0, 0, 0]} />
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Large Pale Moon & Soft Glow Aura
// -------------------------------------------------------------
function Moon({ scrollProgress, cursor, reducedMotion }) {
  const moonRef = useRef();
  const { viewport } = useThree();

  useFrame((state, delta) => {
    if (!moonRef.current || reducedMotion) return;
    const time = state.clock.elapsedTime;
    const isMobile = viewport.width < 3.2;

    // Camera scroll dolly pulls camera toward moon as pumpkin recedes
    const targetY = isMobile ? 1.6 + scrollProgress * 0.45 : 1.35 + scrollProgress * 0.45 + cursor.y * 0.08;
    const targetX = isMobile ? 0.75 + cursor.x * 0.08 : 2.05 + cursor.x * 0.12 + Math.sin(time * 0.15) * 0.04;
    const targetScale = isMobile ? 0.68 : 1.0;

    moonRef.current.position.y = THREE.MathUtils.damp(moonRef.current.position.y, targetY, 2.5, delta);
    moonRef.current.position.x = THREE.MathUtils.damp(moonRef.current.position.x, targetX, 2.5, delta);
    moonRef.current.scale.setScalar(THREE.MathUtils.damp(moonRef.current.scale.x, targetScale, 2.5, delta));
  });

  return (
    <group ref={moonRef} position={[2.05, 1.35, -4.2]}>
      {/* Pale Moon Disc */}
      <mesh>
        <circleGeometry args={[1.75, 48]} />
        <meshBasicMaterial color="#ded7be" />
      </mesh>
      {/* Subtle Lunar Texture Details */}
      <mesh position={[-0.32, 0.42, 0.01]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#c2bb9f" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0.45, -0.25, 0.01]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#b8b196" transparent opacity={0.18} />
      </mesh>
      {/* Soft Glow Halo Sprite */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[2.8, 36]} />
        <meshBasicMaterial color="#eee8d5" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Drifting Volumetric Fog Layers (Transparent planes at depths)
// -------------------------------------------------------------
function FogLayers({ scrollProgress, reducedMotion }) {
  const fogRef1 = useRef();
  const fogRef2 = useRef();
  const fogRef3 = useRef();

  useFrame((state) => {
    if (reducedMotion) return;
    const time = state.clock.elapsedTime;
    if (fogRef1.current) {
      fogRef1.current.position.x = -1.2 + Math.sin(time * 0.08) * 0.8;
      fogRef1.current.position.y = -0.6 - scrollProgress * 0.8;
    }
    if (fogRef2.current) {
      fogRef2.current.position.x = 1.0 + Math.cos(time * 0.06) * 1.1;
      fogRef2.current.position.y = 0.2 - scrollProgress * 1.2;
    }
    if (fogRef3.current) {
      fogRef3.current.position.x = 0.0 + Math.sin(time * 0.05 + 1.2) * 1.3;
      fogRef3.current.position.y = -1.1 - scrollProgress * 0.5;
    }
  });

  return (
    <group>
      {/* Fog Layer 1 - Deep */}
      <mesh ref={fogRef1} position={[-1.2, -0.6, -3.2]}>
        <planeGeometry args={[14, 5.5]} />
        <meshBasicMaterial color="#3a4852" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Fog Layer 2 - Mid */}
      <mesh ref={fogRef2} position={[1.0, 0.2, -1.8]}>
        <planeGeometry args={[12, 4.5]} />
        <meshBasicMaterial color="#2b3b42" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      {/* Fog Layer 3 - Near Foreground Ground Mist */}
      <mesh ref={fogRef3} position={[0.0, -1.1, -0.5]}>
        <planeGeometry args={[15, 3.8]} />
        <meshBasicMaterial color="#1f2c33" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Instanced Flapping Bats Crossing the Scene
// -------------------------------------------------------------
function Bats({ reducedMotion }) {
  const count = 6;
  const meshRef = useRef();

  // Create simple flat bat silhouette shape
  const batGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Center head
    shape.moveTo(0, 0.08);
    // Left wing
    shape.quadraticCurveTo(-0.25, 0.28, -0.65, 0.18);
    shape.quadraticCurveTo(-0.45, -0.05, -0.32, -0.15);
    shape.quadraticCurveTo(-0.18, -0.05, 0, -0.12);
    // Right wing (mirrored)
    shape.quadraticCurveTo(0.18, -0.05, 0.32, -0.15);
    shape.quadraticCurveTo(0.45, -0.05, 0.65, 0.18);
    shape.quadraticCurveTo(0.25, 0.28, 0, 0.08);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const batData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      speed: 0.35 + (i % 3) * 0.15,
      flapSpeed: 9.0 + (i % 4) * 2.0,
      scale: 0.22 + (i % 3) * 0.1,
      yBase: 0.6 + (i * 0.45) % 2.2,
      zBase: -1.2 - (i * 0.6),
      offset: i * 2.4,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    batData.forEach((b, i) => {
      if (reducedMotion) {
        dummy.position.set(0.5 + i * 0.4, b.yBase, b.zBase);
        dummy.scale.set(b.scale, b.scale, b.scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        return;
      }

      // Crossing trajectory from left (-6) to right (+6)
      const progress = ((time * b.speed + b.offset) % 14) - 7;
      const x = progress;
      const y = b.yBase + Math.sin(time * 1.5 + b.offset) * 0.25;
      const z = b.zBase + Math.cos(time * 0.8 + b.offset) * 0.3;

      // Wing flap via scaling Y/Z slightly
      const flap = Math.sin(time * b.flapSpeed);
      const scaleX = b.scale;
      const scaleY = b.scale * (0.8 + flap * 0.35);

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleX, scaleY, b.scale);
      dummy.rotation.z = Math.sin(time * 2.0 + b.offset) * 0.15 + (progress > 0 ? 0.08 : -0.08);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[batGeometry, null, count]}>
      <meshBasicMaterial color="#08090b" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// -------------------------------------------------------------
// Rising Embers (Vulcan Pixel Motif) & Firefly Lights
// -------------------------------------------------------------
function EmbersAndFireflies({ reducedMotion }) {
  const emberCount = 28;
  const fireflyCount = 5;

  const { emberGeometry, fireflyGeometry } = useMemo(() => {
    // Vulcan pixel motif: tiny flat squares
    const eg = new THREE.PlaneGeometry(0.045, 0.045);
    const fg = new THREE.CircleGeometry(0.035, 12);
    return { emberGeometry: eg, fireflyGeometry: fg };
  }, []);

  const emberData = useMemo(() => {
    return Array.from({ length: emberCount }, (_, i) => ({
      x: -3.5 + Math.random() * 7.0,
      y: -2.0 + Math.random() * 4.5,
      z: -1.0 - Math.random() * 2.5,
      speed: 0.3 + Math.random() * 0.45,
      drift: 0.8 + Math.random() * 1.2,
      phase: Math.random() * 10,
      color: i % 3 === 0 ? 0xff7a1a : 0xf5a623,
    }));
  }, [emberCount]);

  const fireflyData = useMemo(() => {
    return Array.from({ length: fireflyCount }, (_, i) => ({
      x: -2.0 + Math.random() * 4.0,
      y: -0.5 + Math.random() * 2.0,
      z: 0.0 - Math.random() * 1.5,
      phase: i * 1.8,
    }));
  }, [fireflyCount]);

  const emberRef = useRef();
  const fireflyRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (emberRef.current) {
      emberData.forEach((d, i) => {
        if (reducedMotion) {
          dummy.position.set(d.x, d.y, d.z);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          emberRef.current.setMatrixAt(i, dummy.matrix);
          return;
        }

        const y = ((d.y + time * d.speed) % 5.5) - 2.2;
        const x = d.x + Math.sin(time * 0.8 + d.phase) * 0.35;
        dummy.position.set(x, y, d.z);
        dummy.rotation.z = time * 0.5 + d.phase;
        dummy.updateMatrix();
        emberRef.current.setMatrixAt(i, dummy.matrix);
      });
      emberRef.current.instanceMatrix.needsUpdate = true;
    }

    if (fireflyRef.current) {
      fireflyData.forEach((f, i) => {
        if (reducedMotion) {
          dummy.position.set(f.x, f.y, f.z);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          fireflyRef.current.setMatrixAt(i, dummy.matrix);
          return;
        }

        const x = f.x + Math.sin(time * 0.6 + f.phase) * 0.45;
        const y = f.y + Math.cos(time * 0.7 + f.phase) * 0.35;
        const pulse = 0.6 + 0.4 * Math.sin(time * 2.5 + f.phase);
        dummy.position.set(x, y, f.z);
        dummy.scale.set(pulse, pulse, pulse);
        dummy.updateMatrix();
        fireflyRef.current.setMatrixAt(i, dummy.matrix);
      });
      fireflyRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={emberRef} args={[emberGeometry, null, emberCount]}>
        <meshBasicMaterial color="#f5a623" side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={fireflyRef} args={[fireflyGeometry, null, fireflyCount]}>
        <meshBasicMaterial color="#7cff4f" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}

// -------------------------------------------------------------
// Rare Subtle "Something Moved" Spooky Surprises
// (Bat suddenly darting, eyes blinking in dark, single candle flare)
// Rate-limited, smooth easing, no strobing, disabled in reducedMotion
// -------------------------------------------------------------
function SpookySurprises({ reducedMotion }) {
  const [activeEvent, setActiveEvent] = useState(null); // 'bat' | 'eyes'
  const batRef = useRef();
  const eyesRef = useRef();

  useEffect(() => {
    if (reducedMotion) return;
    let timeoutId;

    const scheduleNext = () => {
      // Rare interval between 12 and 20 seconds
      const delay = 12000 + Math.random() * 8000;
      timeoutId = setTimeout(() => {
        const events = ['bat', 'eyes'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        setActiveEvent(chosen);

        setTimeout(() => {
          setActiveEvent(null);
          scheduleNext();
        }, 1600);
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [reducedMotion]);

  useFrame((state) => {
    if (reducedMotion || !activeEvent) return;
    const time = state.clock.elapsedTime;

    if (activeEvent === 'bat' && batRef.current) {
      // Darting bat sweeps across upper foreground
      const progress = ((time * 3.2) % 6) - 3;
      batRef.current.position.x = progress;
      batRef.current.position.y = 1.3 + Math.sin(time * 6) * 0.18;
      batRef.current.position.z = 0.8;
    }

    if (activeEvent === 'eyes' && eyesRef.current) {
      // Eyes blink slowly in deep mist
      const blink = Math.sin((time * 2.8) % Math.PI);
      eyesRef.current.scale.y = Math.max(0.08, Math.abs(blink));
    }
  });

  if (reducedMotion || !activeEvent) return null;

  return (
    <group>
      {activeEvent === 'eyes' && (
        <group ref={eyesRef} position={[-2.2, 0.75, -2.5]}>
          <mesh position={[-0.09, 0, 0]}>
            <circleGeometry args={[0.035, 12]} />
            <meshBasicMaterial color="#e5d85c" />
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <circleGeometry args={[0.035, 12]} />
            <meshBasicMaterial color="#e5d85c" />
          </mesh>
        </group>
      )}
      {activeEvent === 'bat' && (
        <mesh ref={batRef} position={[-3, 1.3, 0.8]} scale={0.22}>
          <planeGeometry args={[0.7, 0.35]} />
          <meshBasicMaterial color="#060709" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// Scene Camera Controller (Scroll-linked dolly & parallax)
// -------------------------------------------------------------
function SceneCamera({ scrollProgress, cursor, reducedMotion }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (reducedMotion) {
      camera.position.set(0, 0, 3.8);
      camera.lookAt(0, 0, 0);
      return;
    }

    // Dolly pullback through fog as user scrolls out of hero
    const targetZ = 3.8 + scrollProgress * 2.6;
    const targetY = scrollProgress * 0.8 + cursor.y * 0.15;
    const targetX = cursor.x * 0.25;

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.2, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.2, delta);

    // Look slightly toward the center-right where pumpkin and moon reside
    camera.lookAt(0.4, 0.1, 0);
  });

  return null;
}

// -------------------------------------------------------------
// Root Halloween Hero 3D Scene Component
// Transparent Canvas behind hero text, performance gated
// -------------------------------------------------------------
export default function HalloweenHeroScene3D({ reducedMotion = false }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [entryProgress, setEntryProgress] = useState(0);

  // Smooth entry animation: fade up from black, light flickers on
  useEffect(() => {
    let start = null;
    let frameId;
    const duration = 1200;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1.0, elapsed / duration);
      setEntryProgress(progress);
      if (progress < 1.0) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Viewport visibility observer: pause rendering when hero is offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll listener: compute hero scroll progress [0, 1]
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = containerRef.current ? containerRef.current.offsetHeight : window.innerHeight;
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1.0, Math.max(0.0, currentScroll / heroHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pointer / Cursor tracking
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setCursor({ x, y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Cap DPR between 1.0 and 1.75 for performance
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio || 1, 1.75);
  }, []);

  return (
    <div
      ref={containerRef}
      className="event-hero-3d"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: entryProgress,
        transition: 'opacity 300ms ease-out',
      }}
    >
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={dpr}
        camera={{ position: [0, 0, 3.8], fov: 46 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <SceneCamera scrollProgress={scrollProgress} cursor={cursor} reducedMotion={reducedMotion} />

        {/* Ambient Dark Night Lighting */}
        <ambientLight intensity={0.48 * entryProgress} color="#384a56" />

        {/* Warm Front-Right Key Light highlighting pumpkin ribs */}
        <directionalLight
          position={[2.8, 1.6, 3.2]}
          intensity={1.7 * entryProgress}
          color="#ffb266"
        />

        {/* Soft Cool Fill Light from opposite side */}
        <directionalLight
          position={[-2.4, 0.8, 2.2]}
          intensity={0.5 * entryProgress}
          color="#486478"
        />

        {/* Soft Moon Rim Light from behind */}
        <directionalLight
          position={[3.8, 3.2, -2.2]}
          intensity={0.9 * entryProgress}
          color="#dce8f0"
        />

        {/* Jack-O'-Lantern with interior candle light */}
        <JackOLantern
          scrollProgress={scrollProgress}
          cursor={cursor}
          reducedMotion={reducedMotion}
          entryProgress={entryProgress}
        />

        {/* Pale Moon */}
        <Moon scrollProgress={scrollProgress} cursor={cursor} reducedMotion={reducedMotion} />

        {/* Drifting Volumetric Fog Layers */}
        <FogLayers scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

        {/* Instanced Flapping Bats */}
        <Bats reducedMotion={reducedMotion} />

        {/* Rising Vulcan Pixel Embers & Fireflies */}
        <EmbersAndFireflies reducedMotion={reducedMotion} />

        {/* Rare Spooky Surprises in 3D Scene */}
        <SpookySurprises reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
