import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import LogoMark3DV2 from './LogoMark3DV2';

export default function LogoMarkV2Preview() {
  return (
    <Canvas
      orthographic
      frameloop="demand"
      camera={{ position: [0, 0, 5], zoom: 0.58 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
    >
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3.5, 5, 6]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-4, 1, 4]} intensity={0.65} color="#dce8ff" />
      <LogoMark3DV2 frozen />
    </Canvas>
  );
}
