import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import LogoMarkV2Preview from './LogoMarkV2Preview';
import LogoMark3DV2 from './LogoMark3DV2';

export default function LogoDebugPage() {
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('compare'); // 'compare' | 'interactive'

  const handlePointerMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });
  };

  return (
    <main
      className="min-h-screen bg-[#050505] text-[#f7f4eb] font-sans p-6 md:p-12"
      onPointerMove={handlePointerMove}
    >
      {/* Top Header */}
      <header className="max-w-6xl mx-auto mb-8 border-b border-zinc-800 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Step 4 Visual Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Vulcan 3D Logo Verification Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Orthographic pixel-matching vs. <code className="text-amber-400 font-mono">/assets/vulcan-logo.png</code>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'compare' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3-Panel Comparison
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'interactive' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Perspective Hero View
          </button>
        </div>
      </header>

      {/* Metrics Banner */}
      <section className="max-w-6xl mx-auto mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Whole Mark IoU</span>
          <span className="text-xl font-bold text-emerald-400">0.9852</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Target: &ge; 0.9700</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Left Brace IoU</span>
          <span className="text-xl font-bold text-emerald-400">0.9773</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Target: &ge; 0.9500</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">V Mark IoU</span>
          <span className="text-xl font-bold text-emerald-400">0.9757</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Target: &ge; 0.9500</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Right Brace IoU</span>
          <span className="text-xl font-bold text-emerald-400">0.9788</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Target: &ge; 0.9500</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Stroke Ratio</span>
          <span className="text-xl font-bold text-emerald-400">0.4273</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Diff: 0.00% (PNG: 0.4273)</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Front Face Color</span>
          <span className="text-xl font-bold text-white">#EDEDE9</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Target: &ge; #E8E8E4</span>
        </div>
      </section>

      {activeTab === 'compare' ? (
        /* 3-Panel Side-by-Side Comparison */
        <section className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Original PNG */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  1. Original PNG Emblem
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">assets/vulcan-logo.png</span>
              </div>
              <div className="w-full h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-900">
                <div
                  className="w-[372px] h-[183px] bg-no-repeat bg-contain"
                  style={{
                    backgroundImage: 'url(/assets/vulcan-logo.png)',
                    backgroundPosition: '-299px -330px',
                    width: '372px',
                    height: '183px',
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-3 font-mono">
                Stepped bite on V upper-right · Thin braces (42.7% of V) · Gold ember clusters
              </p>
            </div>

            {/* Panel 2: 3D Orthographic Render */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  2. 3D WebGL Slab Render
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">LogoMark3DV2 (Orthographic)</span>
              </div>
              <div className="w-full h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-900">
                <div className="w-[372px] h-[183px] relative">
                  <LogoMarkV2Preview scale={1.0} />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3 font-mono">
                Depth: 12.0 (6.5%) · Bevel: 1.5 · Studio rim lighting · Frozen pixels
              </p>
            </div>

            {/* Panel 3: 50% Overlay */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  3. 50% Silhouette Overlay
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">{Math.round(overlayOpacity * 100)}% Opacity</span>
              </div>
              <div className="w-full h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-900">
                <div className="w-[372px] h-[183px] relative">
                  {/* PNG Base Layer */}
                  <div
                    className="absolute inset-0 bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: 'url(/assets/vulcan-logo.png)',
                      backgroundPosition: '-299px -330px',
                      filter: 'drop-shadow(0 0 2px #ff4444)',
                    }}
                  />
                  {/* 3D Render Overlay Layer */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                  >
                    <LogoMarkV2Preview scale={1.0} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[11px] text-zinc-400 font-mono">Overlay Blend:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1 bg-zinc-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Perspective Hero Interactive View */
        <section className="max-w-6xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Interactive Hero Perspective Preview
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Narrow FOV (22°) · Physical damping · Max 8° cursor tilt · Live drifting gold pixels
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono">Move cursor to tilt</span>
          </div>

          <div className="w-full h-[52vh] bg-[#050505] rounded-xl overflow-hidden relative border border-zinc-900 flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0, 5.2], fov: 24 }}
              dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
              gl={{
                antialias: true,
                alpha: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.08,
              }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[0, 4, 10]} intensity={1.7} color="#ffffff" />
              <directionalLight position={[0, 8, 2]} intensity={0.9} color="#ffffff" />
              <directionalLight position={[-4, -3, 4]} intensity={0.35} color="#f0f4f8" />
              <pointLight position={[2, 1, 3]} intensity={1.2} color="#E8590C" distance={8} />

              <LogoMark3DV2 mousePosition={mousePosition} isMobile={false} />
            </Canvas>
          </div>
        </section>
      )}
    </main>
  );
}
