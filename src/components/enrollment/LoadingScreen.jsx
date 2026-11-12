import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// Transparent Vulcan Logo SVG Paths (from public/assets/vulcan-mark-v2.svg)
const VULCAN_SVG = {
  leftBrace: "M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z",
  vMark: "M116 34.516v14.517l5.05 12.233c2.777 6.729 7.475 18.084 10.441 25.234 2.965 7.15 7.687 18.625 10.492 25.5 2.805 6.875 5.513 13.4 6.018 14.5.505 1.1 3.891 9.2 7.524 18 12.931 31.318 17.812 43.099 20.924 50.5l3.154 7.5 24.165.268 24.166.267 1.898-4.267c1.044-2.348 2.712-6.518 3.705-9.268.994-2.75 2.102-5.45 2.463-6 .361-.55 1.465-3.25 2.455-6 .989-2.75 2.386-6.35 3.105-8 .718-1.65 2.927-7.05 4.908-12.0 1.981-4.95 4.02-9.9 4.532-11 .512-1.1 2.551-6.05 4.532-11 3.401-8.497 5.446-13.408 7.496-18 .491-1.1 3.382-8.192 6.424-15.76 8.021-19.954 10.502-25.968 11.726-28.423l1.088-2.182-.616-1.604-.615-1.604-9.768.287-9.767.286-.5 14.5-.5 14.5-6.205.297-6.206.296-.294 6.704-.295 6.703-6.5.5-6.5.5-.5 7-.5 7-14.616.276-14.615.276-2.265-5.276c-1.246-2.902-3.498-7.976-5.004-11.276-8.889-19.48-22.504-52.557-32.105-78-1.66-4.4-3.431-9.012-3.935-10.25L160.043 20h-22.022H116v14.516Z",
  rightBrace: "M73.208 24.25C72.63 26.587 71.378 31.65 70.427 35.5c-2.29 9.267-5.824 20.128-9.022 27.726-7.472 17.751-18.904 28.124-34.081 30.922-3.203.591-6.499 1.41-7.324 1.82l-1.5.747-.277 15.258-.276 15.258 1.054 1.27 1.053 1.269 6.223.426 6.223.425 5.5 2.735c9.624 4.785 15.29 10.937 21.323 23.154 4.51 9.131 10.29 26.275 12.583 37.317.608 2.93 1.569 6.192 2.135 7.25l1.029 1.923h20.496 20.496l-.281-12.185-.281-12.186-4-.203c-2.2-.111-7.208-.253-11.129-.314L93.243 178l-1.029-2.75c-.566-1.512-1.779-5.225-2.697-8.25-2.826-9.322-8.62-22.165-13.288-29.455-5.044-7.876-14.66-17.912-20.979-21.893-2.337-1.472-4.25-3.024-4.25-3.449 0-.424 1.4-1.599 3.11-2.609 1.711-1.01 6.256-4.805 10.101-8.432 9.86-9.302 14.138-15.77 20.084-30.369 1.858-4.561 4.162-10.993 5.121-14.293.959-3.3 2.213-7.237 2.785-8.75L93.243 45h10.178 10.179l1.2 1.2 1.2 1.2V33.7 20H95.13 74.26l-1.052 4.25Z",
};

// Ingot progressive reshape profiles (stages 0 through 4)
const INGOT_STAGES = [
  // Stage 0 (0-44%): Raw rectangular ingot billet
  "M150 120 L270 120 Q272 120 272 122 L272 136 Q272 138 270 138 L150 138 Q148 138 148 136 L148 122 Q148 120 150 120 Z",
  // Stage 1 (45-57%): Flattened top with central depression
  "M146 122 Q210 126 274 122 L272 138 L148 138 Z",
  // Stage 2 (58-69%): Trough deepens in center, side wings expand
  "M144 121 Q180 123 194 132 L226 132 Q240 123 276 121 L274 138 L146 138 Z",
  // Stage 3 (70-81%): Center V-trough emerges, outer brackets define
  "M142 120 Q160 122 176 132 L192 132 L210 138 L228 132 L244 132 Q260 122 278 120 L274 138 L146 138 Z",
  // Stage 4 (82-89%): Stepped notches cut on V, ready for final morph
  "M140 119 Q165 120 174 134 L188 134 L210 138 L232 134 L246 134 Q255 120 280 119 L276 138 L144 138 Z",
];

export default function LoadingScreen({
  onLoaded,
  minDuration = 2800,
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { progress: realProgress, active: loadingActive } = useProgress();

  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [ingotStage, setIngotStage] = useState(0);
  const [isHammerStriking, setIsHammerStriking] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [counterPulse, setCounterPulse] = useState(false);
  const [shockwaveActive, setShockwaveActive] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const embersRef = useRef([]);
  const strikesFiredRef = useRef(new Set());
  const exitStartedRef = useRef(false);

  // 1. Lock document scrolling while loading
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // 2. Spawn strike sparks in Canvas2D
  const spawnStrikeSparks = useCallback((count = 20, isFinal = false) => {
    if (prefersReducedMotion || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Impact center coordinates on the anvil ingot
    const originX = rect.width * 0.5;
    const originY = rect.height * 0.44;

    const colors = isFinal
      ? ['#FFFFFF', '#FEF08A', '#FBBF24', '#F97316', '#EA580C', '#FFFFFF']
      : ['#FFFFFF', '#FFF1CC', '#FBBF24', '#F97316', '#FF6B00'];

    for (let i = 0; i < count; i++) {
      // Fan upward and outward
      const angle = isFinal
        ? (Math.random() * Math.PI * 2)
        : (-Math.PI * 0.15 - Math.random() * Math.PI * 0.7); // mostly upward arc
      const speed = isFinal
        ? (300 + Math.random() * 450)
        : (220 + Math.random() * 380);

      sparksRef.current.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.0 + Math.random() * 2.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 1.2 + Math.random() * 1.6, // fades over ~0.5 - 0.8s
        gravity: 750,
      });
    }
  }, [prefersReducedMotion]);

  // 3. Trigger hammer strike event
  const triggerStrike = useCallback((stageIndex, isFinal = false) => {
    if (prefersReducedMotion) {
      if (stageIndex !== undefined) setIngotStage(stageIndex);
      return;
    }

    setIsHammerStriking(true);
    setFlashWhite(true);
    setScreenShake(true);
    setCounterPulse(true);

    if (stageIndex !== undefined) {
      setIngotStage(stageIndex);
    }

    spawnStrikeSparks(isFinal ? 45 : 22, isFinal);

    // Turn off short burst flags
    setTimeout(() => setFlashWhite(false), 90);
    setTimeout(() => setScreenShake(false), 85);
    setTimeout(() => setCounterPulse(false), 140);
    setTimeout(() => setIsHammerStriking(false), 320);
  }, [prefersReducedMotion, spawnStrikeSparks]);

  // 4. Particle simulation loop (Canvas2D)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Seed continuous ambient embers rising from bottom
    const emberCount = 32;
    embersRef.current = Array.from({ length: emberCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 100,
      radius: 1.5 + Math.random() * 2.2,
      baseSpeedY: 35 + Math.random() * 45,
      wobbleSpeed: 1.5 + Math.random() * 2.0,
      wobbleAmp: 10 + Math.random() * 14,
      seed: Math.random() * 100,
      alpha: 0.3 + Math.random() * 0.5,
      color: Math.random() > 0.4 ? '#FF6B00' : '#F59E0B',
    }));

    const render = (time) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // 1. Update and draw ambient embers
      const progressFactor = displayProgress / 100;
      const speedMultiplier = 1 + progressFactor * 1.5;

      embersRef.current.forEach((ember) => {
        ember.y -= ember.baseSpeedY * speedMultiplier * dt;
        ember.x += Math.sin(time * 0.001 * ember.wobbleSpeed + ember.seed) * (ember.wobbleAmp * dt);

        if (ember.y < -20) {
          ember.y = height + 10 + Math.random() * 40;
          ember.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
        ctx.fillStyle = ember.color;
        ctx.globalAlpha = ember.alpha * (0.4 + 0.6 * progressFactor);
        ctx.fill();
      });

      // 2. Update and draw strike sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const p = sparksRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravity * dt;
        p.vx *= 0.98;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [prefersReducedMotion, displayProgress]);

  // 5. Main Progress Easing & Sequencing Loop
  useEffect(() => {
    const startTime = performance.now();
    const effectiveMinDuration = Math.max(2500, minDuration);
    let frameId = null;
    let cur = 0;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const timePercent = Math.min(100, (elapsed / effectiveMinDuration) * 100);

      // If real Three.js assets take longer, pause near ~88% until ready
      const assetTarget = loadingActive ? realProgress : 100;
      let target = Math.min(timePercent, assetTarget);

      // Once past minimum duration and assets finished, glide to 100%
      if (elapsed >= effectiveMinDuration && (!loadingActive || realProgress >= 100)) {
        target = 100;
      }

      // Smooth easing step
      const step = (target - cur) * 0.14;
      cur = Math.min(100, cur + Math.max(0.2, step));
      setDisplayProgress(cur);

      // Trigger strikes at key percentage milestones
      if (cur >= 46 && !strikesFiredRef.current.has(1)) {
        strikesFiredRef.current.add(1);
        triggerStrike(1);
      }
      if (cur >= 58 && !strikesFiredRef.current.has(2)) {
        strikesFiredRef.current.add(2);
        triggerStrike(2);
      }
      if (cur >= 70 && !strikesFiredRef.current.has(3)) {
        strikesFiredRef.current.add(3);
        triggerStrike(3);
      }
      if (cur >= 82 && !strikesFiredRef.current.has(4)) {
        strikesFiredRef.current.add(4);
        triggerStrike(4);
      }

      // 100% Final Heavy Strike & Exit Sequence
      if (cur >= 99.8 && !strikesFiredRef.current.has(5) && !exitStartedRef.current) {
        strikesFiredRef.current.add(5);
        exitStartedRef.current = true;
        triggerStrike(5, true);
        setShockwaveActive(true);

        // Notify parent as exit begins so the intro scene starts animating simultaneously
        if (onLoaded) onLoaded();

        // Graceful exit after final strike shockwave (~800ms)
        setTimeout(() => {
          setVisible(false);
        }, 820);

        return; // sequence complete
      }

      if (cur < 100) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [minDuration, onLoaded, loadingActive, realProgress, triggerStrike]);

  // Status text cycles with progress
  const statusText = useMemo(() => {
    if (displayProgress < 20) return 'LIGHTING THE FURNACE';
    if (displayProgress < 40) return 'HEATING THE METAL';
    if (displayProgress < 65) return 'STRIKING THE IRON';
    if (displayProgress < 85) return 'SHAPING THE EMBLEM';
    if (displayProgress < 96) return 'QUENCHING';
    return 'READY';
  }, [displayProgress]);

  // Tabular 3-digit percentage ("072")
  const formattedPercent = useMemo(() => {
    return String(Math.min(100, Math.floor(displayProgress))).padStart(3, '0');
  }, [displayProgress]);

  // Ingot dynamic glow styling
  const isMorphActive = displayProgress >= 90;
  const ingotHeatColor = useMemo(() => {
    if (displayProgress < 20) return '#7F1D1D'; // deep ruby ember
    if (displayProgress < 40) return '#DC2626'; // hot cherry red
    if (displayProgress < 65) return '#EA580C'; // incandescent fiery orange
    if (displayProgress < 85) return '#F97316'; // blazing orange
    return '#FF6B00'; // molten gold/orange
  }, [displayProgress]);

  const ingotCoreColor = useMemo(() => {
    if (displayProgress < 25) return '#991B1B';
    if (displayProgress < 50) return '#EA580C';
    if (displayProgress < 75) return '#FBBF24';
    return '#FEF08A'; // white-hot
  }, [displayProgress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          role="status"
          aria-busy="true"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white select-none overflow-hidden ${
            screenShake ? 'translate-x-[3px] -translate-y-[2px]' : ''
          }`}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          {/* Screen Reader Label */}
          <span className="sr-only">Loading Vulcan Club Enrollment 2026</span>

          {/* Fullscreen Canvas2D Spark Layer */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Flash-White on Hammer Impact */}
          <div
            className={`fixed inset-0 bg-white pointer-events-none z-30 transition-opacity duration-75 ${
              flashWhite ? 'opacity-35' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* Final Shockwave Ring Expanding at 100% */}
          {shockwaveActive && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 pointer-events-none z-20"
              initial={{ width: 20, height: 20, opacity: 0.9 }}
              animate={{ width: 720, height: 720, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}

          {/* Radial Ember Glow behind Anvil (grows with progress) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 blur-3xl transition-transform duration-300"
            style={{
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(234,88,12,0.32) 0%, rgba(185,28,28,0.16) 45%, transparent 75%)',
              transform: `translate(-50%, -50%) scale(${0.8 + (displayProgress / 100) * 0.45})`,
            }}
            aria-hidden="true"
          />

          {/* ================= STAGE: ANVIL + INGOT + HAMMER ================= */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-[240px] sm:w-[320px] md:w-[360px] aspect-[4/3] flex items-center justify-center">
              <svg
                viewBox="0 0 400 280"
                className="w-full h-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  {/* Subtle Heat Shimmer Rising Filter */}
                  <filter id="heatShimmer" x="-20%" y="-40%" width="140%" height="180%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.04 0.09"
                      numOctaves="2"
                      result="noise"
                    >
                      <animate
                        attributeName="baseFrequency"
                        dur="1.6s"
                        values="0.04 0.08; 0.05 0.12; 0.04 0.08"
                        repeatCount="indefinite"
                      />
                    </feTurbulence>
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="3.5"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>

                  {/* Anvil Rim Light Gradient */}
                  <linearGradient id="anvilSteel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E2026" />
                    <stop offset="60%" stopColor="#121316" />
                    <stop offset="100%" stopColor="#0B0C0E" />
                  </linearGradient>

                  <linearGradient id="anvilRim" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* 1. ANVIL BASE & BODY (Dark Steel with orange rim-lit edges) */}
                <g id="anvil-silhouette">
                  {/* Main Anvil Body */}
                  <path
                    d="M100 240 L300 240 L288 215 L252 205 L242 168 L158 168 L148 205 L112 215 Z"
                    fill="url(#anvilSteel)"
                    stroke="#27272A"
                    strokeWidth="1.5"
                  />
                  {/* Waist highlight */}
                  <path
                    d="M158 168 L242 168"
                    stroke="#FB923C"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  />

                  {/* Anvil Horn (Left Conical Point) */}
                  <path
                    d="M148 140 Q105 146 65 152 Q105 158 148 168 Z"
                    fill="#181A20"
                    stroke="#27272A"
                    strokeWidth="1"
                  />

                  {/* Anvil Heel (Right Block) */}
                  <path
                    d="M260 140 L325 140 L325 168 L250 168 Z"
                    fill="#15171C"
                    stroke="#27272A"
                    strokeWidth="1"
                  />

                  {/* Anvil Face / Flat Table (Top working surface where ingot rests) */}
                  <path
                    d="M146 140 L275 140"
                    stroke="url(#anvilRim)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Anvil Horn Specular Edge */}
                  <path
                    d="M65 152 Q105 146 146 140"
                    stroke="#F97316"
                    strokeOpacity="0.5"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Hardy hole on anvil heel */}
                  <rect x="296" y="143" width="10" height="5" fill="#090A0C" rx="1" />
                </g>

                {/* 2. HEAT SHIMMER FIELD (Rises from ingot 0-40%) */}
                {!prefersReducedMotion && (
                  <rect
                    x="130"
                    y="70"
                    width="160"
                    height="70"
                    fill="none"
                    filter="url(#heatShimmer)"
                    opacity={displayProgress < 85 ? 0.8 : 0.3}
                  />
                )}

                {/* 3. INGOT / TRANSFORMING EMBLEM (Rests on anvil face y=118-140) */}
                <g id="ingot-group">
                  {/* Heat Core Glow Halo */}
                  <ellipse
                    cx="210"
                    cy="128"
                    rx={isMorphActive ? 55 : 45}
                    ry={isMorphActive ? 28 : 16}
                    fill={ingotHeatColor}
                    opacity={0.35 + (displayProgress / 100) * 0.45}
                    filter="blur(8px)"
                  />

                  {/* Reshaping Ingot (0 - 90%) */}
                  {!isMorphActive ? (
                    <g>
                      {/* Ingot base path */}
                      <path
                        d={INGOT_STAGES[Math.min(ingotStage, INGOT_STAGES.length - 1)]}
                        fill={ingotHeatColor}
                        stroke={flashWhite ? '#FFFFFF' : ingotCoreColor}
                        strokeWidth={flashWhite ? 3 : 1.5}
                        className="transition-all duration-150"
                      />
                      {/* Incandescent molten inner vein */}
                      <ellipse
                        cx="210"
                        cy="128"
                        rx="30"
                        ry="4"
                        fill={flashWhite ? '#FFFFFF' : ingotCoreColor}
                        opacity={0.8}
                      />
                    </g>
                  ) : (
                    /* Stage 5 (90-100%): Full Morph into Real Vulcan Logo */
                    <g
                      transform="translate(150, 72) scale(0.29)"
                      className="transition-opacity duration-300"
                    >
                      {/* Left Brace */}
                      <path
                        d={VULCAN_SVG.leftBrace}
                        fill={flashWhite ? '#FFFFFF' : '#FF6B00'}
                        stroke={flashWhite ? '#FFFFFF' : '#FFB703'}
                        strokeWidth="2"
                      />
                      {/* Center V Mark */}
                      <path
                        d={VULCAN_SVG.vMark}
                        fill={flashWhite ? '#FFFFFF' : '#FF7A00'}
                        stroke={flashWhite ? '#FFFFFF' : '#FFE6A7'}
                        strokeWidth="2"
                      />
                      {/* Right Brace */}
                      <path
                        d={VULCAN_SVG.rightBrace}
                        transform="translate(408 0) scale(-1 1)"
                        fill={flashWhite ? '#FFFFFF' : '#FF6B00'}
                        stroke={flashWhite ? '#FFFFFF' : '#FFB703'}
                        strokeWidth="2"
                      />

                      {/* Rising Gold Pixel Blocks from V Notch */}
                      <rect x="230" y="45" width="12" height="12" fill="#FFD166" rx="1" />
                      <rect x="245" y="60" width="10" height="10" fill="#FFB703" rx="1" />
                      <rect x="220" y="80" width="9" height="9" fill="#FF8800" rx="1" />
                      <rect x="240" y="25" width="8" height="8" fill="#FFE6A7" rx="1" />
                    </g>
                  )}
                </g>

                {/* 4. FORGING HAMMER SILHOUETTE (Swings down on strikes 40-90%) */}
                {!prefersReducedMotion && (
                  <g
                    id="forge-hammer"
                    transform={
                      isHammerStriking
                        ? 'translate(210, 118) rotate(2)' // impact position
                        : 'translate(285, 45) rotate(-42)' // raised ready position
                    }
                    className="transition-transform duration-100 ease-in origin-top-right"
                    style={{ transformOrigin: '320px 40px' }}
                  >
                    {/* Hammer Handle */}
                    <path
                      d="M175 18 L310 32 L308 40 L173 26 Z"
                      fill="#1C1917"
                      stroke="#44403C"
                      strokeWidth="1"
                    />
                    {/* Hammer Head (Forged Steel with orange rim specular) */}
                    <rect
                      x="145"
                      y="10"
                      width="42"
                      height="26"
                      rx="3"
                      fill="#18181B"
                      stroke="#FB923C"
                      strokeWidth="1.5"
                    />
                    {/* Chamfered Striking Face */}
                    <rect
                      x="142"
                      y="13"
                      width="5"
                      height="20"
                      fill="#27272A"
                      stroke="#FB923C"
                      strokeWidth="1"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* ================= HUGE PERCENTAGE COUNTER ================= */}
            <div
              className={`font-mono tabular-nums text-6xl sm:text-7xl md:text-8xl font-black text-[#FBBF24] tracking-tight leading-none mt-2 transition-transform duration-75 ${
                counterPulse ? 'scale-105' : 'scale-100'
              }`}
              style={{
                textShadow:
                  '0 0 25px rgba(245,166,35,0.45), 0 0 50px rgba(234,88,12,0.25)',
              }}
            >
              {formattedPercent}
            </div>

            {/* ================= 3PX PROGRESS LINE & GLOWING HEAD ================= */}
            <div className="relative w-64 sm:w-80 md:w-96 h-[3px] rounded-full bg-zinc-900 border border-zinc-800/80 mt-5 overflow-visible">
              {/* Fill Gradient */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 relative"
                style={{ width: `${displayProgress}%` }}
              >
                {/* Glowing Leading Head */}
                {displayProgress > 0 && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#FFF,0_0_24px_#F5A623]"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            {/* ================= 13PX STATUS TEXT (ANIMATED FADE/SLIDE) ================= */}
            <div className="h-6 mt-3.5 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusText}
                  className="font-mono text-[11px] sm:text-[13px] uppercase tracking-[0.3em] text-[#FDBA74] font-semibold text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {statusText}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
