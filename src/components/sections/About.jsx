import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CLUB_INFO } from '../../content';

gsap.registerPlugin(ScrollTrigger);

// Exact geometric centreline SVG paths derived from the official Vulcan emblem (Thinner ~50% stroke weight)
const LEFT_BRACE_PATH =
  'M 100 9 L 50 9 L 50 55 L 40 55 L 40 95 L 11 145 L 40 195 L 40 235 L 50 235 L 50 281 L 100 281';

const RIGHT_BRACE_PATH =
  'M 0 9 L 50 9 L 50 55 L 60 55 L 60 95 L 89 145 L 60 195 L 60 235 L 50 235 L 50 281 L 0 281';

// Small floating gold pixels motif (positioned around braces, never over text)
const FLOATING_PIXELS = [
  { id: 1, top: '15%', left: '4%', size: 6, driftX: -18, driftY: -35 },
  { id: 2, top: '48%', left: '2%', size: 5, driftX: -24, driftY: 20 },
  { id: 3, top: '82%', left: '6%', size: 6, driftX: 15, driftY: 30 },
  { id: 4, top: '18%', right: '4%', size: 5, driftX: 22, driftY: -30 },
  { id: 5, top: '52%', right: '2%', size: 6, driftX: 20, driftY: 25 },
  { id: 6, top: '78%', right: '5%', size: 5, driftX: -14, driftY: 35 },
  { id: 7, top: '10%', left: '7%', size: 4, driftX: -10, driftY: -20 },
  { id: 8, bottom: '12%', right: '7%', size: 4, driftX: 12, driftY: 25 },
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

      {/* Decorative Drifting Orange Pixels */}
      {FLOATING_PIXELS.map((p, index) => {
        const orangeShades = ['#E8590C', '#D9480F', '#F76707', '#EB6318', '#DE520A'];
        const color = orangeShades[index % orangeShades.length];
        return (
          <div
            key={p.id}
            ref={(el) => (pixelRefs.current[index] = el)}
            className="absolute pointer-events-none z-0 rounded-[1px]"
            style={{
              top: p.top,
              bottom: p.bottom,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: color,
              opacity: 1.0,
              boxShadow: `0 0 10px ${color}aa, 0 0 3px ${color}`,
            }}
            aria-hidden="true"
          />
        );
      })}

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
            className="w-8 sm:w-12 md:w-16 lg:w-20 h-auto transition-colors drop-shadow-[0_0_12px_rgba(245,245,242,0.18)] drop-shadow-[0_0_24px_rgba(245,166,35,0.12)]"
          >
            <path
              d={LEFT_BRACE_PATH}
              fill="none"
              stroke="#F5F5F2"
              strokeWidth="18"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />
          </svg>
        </div>

        {/* Text lines between braces */}
        <div className="flex-1 px-4 sm:px-8 md:px-12 text-center max-w-3xl mx-auto space-y-6 md:space-y-8 z-10 overflow-hidden">
          {/* Line 1: Tightly enclosed at start */}
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[clamp(1.85rem,2.8vw,2.75rem)] font-bold tracking-tight text-white leading-[1.18] font-sans">
              {CLUB_INFO.about.line1.includes('compete') ? (
                <>
                  <span className="block">
                    {CLUB_INFO.about.line1.split('compete')[0]}compete
                  </span>
                  <span className="block">
                    {CLUB_INFO.about.line1.split('compete')[1].trim()}
                  </span>
                </>
              ) : (
                CLUB_INFO.about.line1
              )}
            </h2>
          </div>

          {/* Line 2: Mask-revealed on scroll */}
          <div className="overflow-hidden py-1">
            <div
              ref={line2InnerRef}
              className={prefersReducedMotion ? 'opacity-100' : ''}
            >
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-[60ch] mx-auto">
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
            className="w-8 sm:w-12 md:w-16 lg:w-20 h-auto transition-colors drop-shadow-[0_0_12px_rgba(245,245,242,0.18)] drop-shadow-[0_0_24px_rgba(245,166,35,0.12)]"
          >
            <path
              d={RIGHT_BRACE_PATH}
              fill="none"
              stroke="#F5F5F2"
              strokeWidth="18"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
