import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// Exact same 3-path clean Vulcan logo mark as VulcanEmblem3D
// 1. Left chevron (<)
// 2. Thin hollow V
// 3. Right chevron (>)
const LEFT_CHEVRON =
  'M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z';

const THIN_V =
  'M136 20 L204 188 L272 20 L252 20 L204 144 L156 20 Z';

export default function LoadingScreen({
  onLoaded,
  minDuration = 1100,
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { progress: realProgress } = useProgress();

  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);

  const canvasRef = useRef(null);
  const embersRef = useRef([]);
  const startTimeRef = useRef(0);
  const isCompletingRef = useRef(false);

  // 1. Lock document scrolling during loading
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // 2. Continuous ripple wave animation for molten surface meniscus
  useEffect(() => {
    if (prefersReducedMotion) return;
    let animId;
    const animateWave = (t) => {
      setWavePhase(t * 0.005);
      animId = requestAnimationFrame(animateWave);
    };
    animId = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion]);

  // 3. Smooth progressive loader controller
  useEffect(() => {
    let animId;
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeRatio = (elapsed / minDuration) * 100;
      const assetProgress = typeof realProgress === 'number' && realProgress > 0 ? realProgress : 100;

      // Target progress determination
      let target = Math.min(timeRatio, 99.5);
      if (elapsed >= minDuration && assetProgress >= 100) {
        target = 100;
      }

      setDisplayProgress((prev) => {
        if (prev >= 100) return 100;
        const diff = target - prev;
        const step = Math.max(0.6, diff * 0.16);
        const next = prev + step;
        return next >= 99.8 && target >= 100 ? 100 : next;
      });

      if (displayProgress < 100) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [minDuration, realProgress, displayProgress]);

  // 4. Exit sequence triggered once 100% is reached
  useEffect(() => {
    if (displayProgress >= 100 && !isCompletingRef.current) {
      isCompletingRef.current = true;
      setIsExiting(true);

      if (prefersReducedMotion) {
        // Fast exit for reduced motion
        setTimeout(() => {
          setVisible(false);
          onLoaded?.();
        }, 150);
        return;
      }

      // Step A: Logo flash bright (~100ms)
      setIsFlashing(true);
      setShowRing(true);

      const flashTimeout = setTimeout(() => {
        setIsFlashing(false);
      }, 100);

      // Step B: Ring finishes and loader fades out over ~380ms
      const fadeTimeout = setTimeout(() => {
        setVisible(false);
        onLoaded?.();
      }, 380);

      return () => {
        clearTimeout(flashTimeout);
        clearTimeout(fadeTimeout);
      };
    }
  }, [displayProgress, prefersReducedMotion, onLoaded]);

  // 5. Canvas2D Embers: 20-30 tiny glowing round points (2-3px) rising from base
  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const count = 26;
    const embers = [];
    const colors = ['#F97316', '#FDBA74', '#FBBF24'];

    for (let i = 0; i < count; i++) {
      embers.push({
        x: 100 + Math.random() * 120, // centered relative to canvas width
        y: 160 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: -24 - Math.random() * 38,
        radius: 1.0 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 1.5 + Math.random() * 2.0,
      });
    }
    embersRef.current = embers;

    let lastTime = performance.now();
    const render = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      const activityMultiplier = 0.6 + 0.5 * (displayProgress / 100);

      embersRef.current.forEach((p) => {
        p.y += p.vy * dt * activityMultiplier;
        p.x += Math.sin(now * 0.002 * p.swaySpeed + p.phase) * 0.6;
        p.alpha -= dt * 0.28;

        // Reset ember to logo base when it floats away or fades
        if (p.y < 20 || p.alpha <= 0) {
          p.x = 90 + Math.random() * 140;
          p.y = 180 + Math.random() * 50;
          p.alpha = 0.35 + Math.random() * 0.55;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion, displayProgress]);

  // Outline stroke draw progress (0-15%)
  const outlineProgress = Math.min(1, displayProgress / 15);
  const outlineOffset = prefersReducedMotion ? 0 : (1 - outlineProgress) * 100;

  // Molten fill level (15-100%)
  // Logo Y bounds: ~18 (top) to ~190 (bottom)
  const fillProgress = Math.max(0, (displayProgress - 15) / 85);
  const fillTopY = 195 - fillProgress * (195 - 16);

  // Status text determination
  const statusText = useMemo(() => {
    if (displayProgress >= 95) return 'READY';
    if (displayProgress >= 70) return 'SHAPING THE EMBLEM';
    if (displayProgress >= 35) return 'HEATING THE METAL';
    return 'LIGHTING THE FURNACE';
  }, [displayProgress]);

  // Formatted percentage string (e.g. "085%")
  const pctString = `${String(Math.min(100, Math.round(displayProgress))).padStart(3, '0')}%`;

  // Dynamic drop shadow glow based on molten progress
  const logoGlowRadius = 4 + 18 * (displayProgress / 100);
  const logoGlowAlpha = 0.25 + 0.45 * (displayProgress / 100);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-busy="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none transition-opacity duration-350 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <span className="sr-only">Loading Vulcan Club Enrollment 2026</span>

      {/* 1. Background subtle vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Soft radial glow behind the logo (#7C2D12 to transparent, ~25% opacity, grows slightly with progress) */}
      <motion.div
        className="absolute rounded-full pointer-events-none blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{
          left: '50%',
          top: '46%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(124, 45, 18, 0.28) 0%, rgba(124, 45, 18, 0.08) 50%, transparent 72%)',
          scale: 1.0 + 0.25 * (displayProgress / 100),
          opacity: 0.20 + 0.12 * (displayProgress / 100),
        }}
        aria-hidden="true"
      />

      {/* 3. Center tight group: Logo, percentage, progress line, and status */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4">
        {/* Canvas2D Embers Overlay around Logo */}
        {!prefersReducedMotion && (
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="absolute -top-6 pointer-events-none z-20 w-[320px] h-[240px]"
            aria-hidden="true"
          />
        )}

        {/* Expanding exit ring at 100% */}
        {showRing && !prefersReducedMotion && (
          <motion.div
            className="absolute rounded-full border border-[#F97316] pointer-events-none z-30"
            style={{
              boxShadow: '0 0 18px rgba(249, 115, 22, 0.65)',
              top: '48px',
            }}
            initial={{ width: 40, height: 40, opacity: 0.9 }}
            animate={{ width: 280, height: 280, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}

        {/* Vulcan Logo: Molten Fill & Stroke */}
        <div
          className={`relative transition-all duration-150 ${
            isFlashing ? 'brightness-[2.2] contrast-125' : ''
          }`}
          style={{
            filter: `drop-shadow(0 0 ${logoGlowRadius}px rgba(249, 115, 22, ${logoGlowAlpha}))`,
          }}
        >
          <svg
            viewBox="0 0 410 230"
            className="w-[150px] sm:w-[200px] h-auto overflow-visible"
            aria-hidden="true"
          >
            <defs>
              {/* Logo shape clip path composed of the exact 3 marks */}
              <clipPath id="vulcanLogoFillClip">
                <path d={LEFT_CHEVRON} />
                <path d={THIN_V} />
                <path d={LEFT_CHEVRON} transform="translate(408 0) scale(-1 1)" />
              </clipPath>

              {/* Molten metal gradient: #7F1D1D bottom -> #F97316 middle -> #FBBF24 surface */}
              <linearGradient id="moltenMetalGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#7F1D1D" />
                <stop offset="48%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>

              {/* Subtle heat shimmer filter on the molten core */}
              <filter id="subtleHeatShimmer" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.04 0.08"
                  numOctaves="1"
                  result="noise"
                  seed={Math.round(wavePhase * 5) % 10}
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={prefersReducedMotion ? 0 : 1.2}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            {/* A. Molten Fill Rising from Bottom (15-100%), clipped to logo shape */}
            {fillProgress > 0 && (
              <g clipPath="url(#vulcanLogoFillClip)">
                <rect
                  x="0"
                  y={fillTopY}
                  width="410"
                  height={240 - fillTopY}
                  fill="url(#moltenMetalGrad)"
                  filter="url(#subtleHeatShimmer)"
                />

                {/* Molten Surface Meniscus with gentle sine-wave ripple */}
                {!prefersReducedMotion && fillProgress < 0.99 && (
                  <path
                    d={`M 0 ${fillTopY} Q 100 ${fillTopY - 2.0 * Math.sin(wavePhase)} 205 ${fillTopY} Q 310 ${
                      fillTopY + 2.0 * Math.sin(wavePhase + 1.2)
                    } 410 ${fillTopY}`}
                    stroke="#FFF7ED"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.9"
                    style={{
                      filter: 'drop-shadow(0 0 4px #FBBF24)',
                    }}
                  />
                )}
              </g>
            )}

            {/* B. Thin Outline (0-15% drawn via dashoffset; stays as glowing contour) */}
            <g
              fill="none"
              stroke="#F97316"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d={LEFT_CHEVRON}
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={outlineOffset}
                opacity={Math.max(0.4, 0.4 + 0.6 * outlineProgress)}
              />
              <path
                d={THIN_V}
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={outlineOffset}
                opacity={Math.max(0.4, 0.4 + 0.6 * outlineProgress)}
              />
              <path
                d={LEFT_CHEVRON}
                transform="translate(408 0) scale(-1 1)"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={outlineOffset}
                opacity={Math.max(0.4, 0.4 + 0.6 * outlineProgress)}
              />
            </g>
          </svg>
        </div>

        {/* 32px gap below logo */}
        <div className="mt-8 flex flex-col items-center">
          {/* Percentage Counter: 28px Monospace, Tabular, #FDBA74 with subtle glow */}
          <div className="font-mono tabular-nums text-[28px] font-bold text-[#FDBA74] tracking-tight drop-shadow-[0_0_12px_rgba(253,186,116,0.35)]">
            {pctString}
          </div>

          {/* 2px Progress Line (240px wide, track rgba(255,255,255,0.08), gradient fill, glowing head) */}
          <div className="relative mt-4 h-[2px] w-[240px] rounded-full bg-white/[0.08] overflow-visible">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B91C1C] via-[#F97316] to-[#FBBF24] transition-all duration-75 ease-out relative"
              style={{ width: `${Math.min(100, displayProgress)}%` }}
            >
              {/* Soft glowing head on progress line */}
              {displayProgress > 0 && (
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FBBF24] pointer-events-none"
                  style={{
                    boxShadow: '0 0 10px #FBBF24, 0 0 4px #F97316',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          {/* Status text: 11px uppercase monospace, letter-spacing 0.35em, color #FDBA74/70, cross-fading */}
          <div className="mt-4 h-5 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.22 }}
                className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#FDBA74] font-medium"
              >
                {statusText}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
