import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import LogoMark3DV2 from './LogoMark3DV2';

export default function LogoMarkV2Preview({ scale = 1.0 }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 100], zoom: 1 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.22,
      }}
      className="w-full h-full"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[0, 4, 10]} intensity={2.35} color="#ffffff" />
      <directionalLight position={[0, 8, 2]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-4, -3, 4]} intensity={0.4} color="#f0f4f8" />
      <LogoMark3DV2 frozen scaleOverride={scale} />
    </Canvas>
  );
}
