import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CLUB_INFO } from '../../content';

gsap.registerPlugin(ScrollTrigger);

// Exact geometric SVG paths derived from the official 3D Vulcan emblem
const LEFT_BRACE_PATH =
  'M 40.0,0.0 L 100.0,0.0 L 100.0,40.0 L 75.0,40.0 L 75.0,113.0 L 35.0,145.0 L 75.0,177.0 L 75.0,250.0 L 100.0,250.0 L 100.0,290.0 L 40.0,290.0 L 40.0,230.0 L 20.0,230.0 L 0.0,145.0 L 20.0,60.0 L 40.0,60.0 Z';

const RIGHT_BRACE_PATH =
  'M 60.0,0.0 L 0.0,0.0 L 0.0,40.0 L 25.0,40.0 L 25.0,113.0 L 65.0,145.0 L 25.0,177.0 L 25.0,250.0 L 0.0,250.0 L 0.0,290.0 L 60.0,290.0 L 60.0,230.0 L 80.0,230.0 L 100.0,145.0 L 80.0,60.0 L 60.0,60.0 Z';

// Small floating gold pixels motif
const FLOATING_PIXELS = [
  { id: 1, top: '15%', left: '4%', size: 6, driftX: -18, driftY: -35 },
  { id: 2, top: '48%', left: '2%', size: 5, driftX: -24, driftY: 20 },
  { id: 3, top: '82%', left: '6%', size: 6, driftX: 15, driftY: 30 },
  { id: 4, top: '18%', right: '4%', size: 5, driftX: 22, driftY: -30 },
  { id: 5, top: '52%', right: '2%', size: 6, driftX: 20, driftY: 25 },
  { id: 6, top: '78%', right: '5%', size: 5, driftX: -14, driftY: 35 },
  { id: 7, top: '8%', left: '28%', size: 4, driftX: -10, driftY: -20 },
  { id: 8, bottom: '10%', right: '26%', size: 4, driftX: 12, driftY: 25 },
];

export default function About({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const leftBraceRef = useRef(null);
  const rightBraceRef = useRef(null);
  const line2InnerRef = useRef(null);
  const line3InnerRef = useRef(null);
  const pixelRefs = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Calculate responsive shift for braces at progress 0
      // In progress 0, braces tightly flank line 1 in the center
      const isMobile = window.innerWidth < 640;
      const initialShift = isMobile ? 52 : 210;

      // Pinned ScrollTrigger scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Set initial positions
      // Left and right braces start hugging line 1
      gsap.set(leftBraceRef.current, { x: initialShift, opacity: 0.95 });
      gsap.set(rightBraceRef.current, { x: -initialShift, opacity: 0.95 });
      gsap.set(line2InnerRef.current, { yPercent: 115, opacity: 0 });
      gsap.set(line3InnerRef.current, { yPercent: 115, opacity: 0 });

      // 0.00 -> 0.55: Braces expand outward smoothly to comfortable width
      tl.to(
        leftBraceRef.current,
        {
          x: 0,
          opacity: 1,
          ease: 'power2.inOut',
          duration: 0.55,
        },
        0
      );

      tl.to(
        rightBraceRef.current,
        {
          x: 0,
          opacity: 1,
          ease: 'power2.inOut',
          duration: 0.55,
        },
        0
      );

      // 0.15 -> 0.48: Line 2 rises smoothly from behind its mask
      tl.to(
        line2InnerRef.current,
        {
          yPercent: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.33,
        },
        0.15
      );

      // 0.48 -> 0.78: Line 3 rises smoothly from behind its mask
      tl.to(
        line3InnerRef.current,
        {
          yPercent: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.30,
        },
        0.48
      );

      // Drift floating gold pixels throughout scroll progress
      pixelRefs.current.forEach((pixel, i) => {
        if (!pixel) return;
        const config = FLOATING_PIXELS[i];
        if (!config) return;
        tl.to(
          pixel,
          {
            x: config.driftX,
            y: config.driftY,
            opacity: 0.85,
            ease: 'sine.inOut',
            duration: 0.95,
          },
          0
        );
      });

      // 0.78 -> 1.0: Hold full scene comfortably in view before unpinning
      tl.to({}, { duration: 0.22 });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center bg-vulcan-bg px-4 sm:px-6 py-20 overflow-hidden border-t border-vulcan-border/30"
    >
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-vulcan-gold/[0.04] rounded-full blur-[110px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.02] rounded-full blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative Drifting Gold Pixels */}
      {FLOATING_PIXELS.map((p, index) => (
        <div
          key={p.id}
          ref={(el) => (pixelRefs.current[index] = el)}
          className="absolute pointer-events-none z-0 rounded-[1px] bg-vulcan-gold"
          style={{
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: prefersReducedMotion ? 0.6 : 0.4,
            boxShadow: '0 0 10px rgba(245, 166, 35, 0.65), 0 0 3px rgba(245, 166, 35, 0.9)',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Main Pinned Center Stage */}
      <div
        ref={containerRef}
        className="relative max-w-5xl w-full mx-auto flex items-center justify-between min-h-[460px] md:min-h-[520px] px-2 sm:px-4 z-10"
      >
        {/* Left Brace (Official Vulcan SVG Silhouette) */}
        <div
          ref={leftBraceRef}
          className="shrink-0 flex items-center justify-center select-none z-20"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 290"
            className="w-8 sm:w-12 md:w-16 lg:w-20 h-auto text-zinc-100 transition-colors drop-shadow-[0_0_16px_rgba(255,255,255,0.22)] drop-shadow-[0_0_32px_rgba(245,166,35,0.12)]"
            fill="currentColor"
          >
            <path d={LEFT_BRACE_PATH} />
          </svg>
        </div>

        {/* Text lines between braces */}
        <div className="flex-1 px-4 sm:px-8 md:px-12 text-center max-w-3xl mx-auto space-y-6 md:space-y-8 z-10 overflow-hidden">
          {/* Line 1: Tightly enclosed at start */}
          <div className="relative">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-sans">
              {CLUB_INFO.about.line1}
            </h2>
          </div>

          {/* Line 2: Mask-revealed on scroll */}
          <div className="overflow-hidden py-1">
            <div
              ref={line2InnerRef}
              className={prefersReducedMotion ? 'opacity-100' : ''}
            >
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
                {CLUB_INFO.about.line2}
              </p>
            </div>
          </div>

          {/* Line 3: Mask-revealed second on scroll */}
          <div className="overflow-hidden pt-2">
            <div
              ref={line3InnerRef}
              className={prefersReducedMotion ? 'opacity-100' : ''}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-vulcan-gold/30 bg-vulcan-gold/[0.07] backdrop-blur-sm shadow-[0_0_20px_rgba(245,166,35,0.12)]">
                <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold shadow-[0_0_6px_rgba(245,166,35,0.9)] animate-pulse" />
                <span className="text-xs sm:text-sm md:text-base font-mono font-medium text-vulcan-gold tracking-wide">
                  {CLUB_INFO.about.line3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Brace (Official Vulcan SVG Silhouette) */}
        <div
          ref={rightBraceRef}
          className="shrink-0 flex items-center justify-center select-none z-20"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 290"
            className="w-8 sm:w-12 md:w-16 lg:w-20 h-auto text-zinc-100 transition-colors drop-shadow-[0_0_16px_rgba(255,255,255,0.22)] drop-shadow-[0_0_32px_rgba(245,166,35,0.12)]"
            fill="currentColor"
          >
            <path d={RIGHT_BRACE_PATH} />
          </svg>
        </div>
      </div>
    </section>
  );
}
