import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CLUB_INFO } from '../../content';

gsap.registerPlugin(ScrollTrigger);

export default function About({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const leftBraceRef = useRef(null);
  const rightBraceRef = useRef(null);
  const textLinesRef = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Braces slide apart
      tl.to(
        leftBraceRef.current,
        {
          x: -160,
          opacity: 0.85,
          ease: 'power2.inOut',
        },
        0
      );

      tl.to(
        rightBraceRef.current,
        {
          x: 160,
          opacity: 0.85,
          ease: 'power2.inOut',
        },
        0
      );

      // Text lines appear between braces one by one
      textLinesRef.current.forEach((line, index) => {
        if (!line) return;
        tl.fromTo(
          line,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            duration: 0.6,
          },
          0.15 + index * 0.2
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center bg-vulcan-bg px-6 py-24 overflow-hidden border-t border-vulcan-border/30"
    >
      {/* Background glow behind center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vulcan-gold/[0.03] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative max-w-4xl w-full mx-auto flex items-center justify-center min-h-[420px]"
      >
        {/* Left Brace */}
        <div
          ref={leftBraceRef}
          className="text-7xl sm:text-8xl md:text-9xl font-mono text-zinc-600 font-light select-none tracking-tighter"
          aria-hidden="true"
        >
          &#123;
        </div>

        {/* Text lines between braces */}
        <div className="px-6 sm:px-10 text-center max-w-xl mx-auto space-y-6 z-10">
          <div
            ref={(el) => (textLinesRef.current[0] = el)}
            className="space-y-1"
          >
            <span className="font-mono text-xs text-vulcan-gold uppercase tracking-widest block font-medium">
              about the club
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-snug">
              {CLUB_INFO.about.lead}
            </h2>
          </div>

          <p
            ref={(el) => (textLinesRef.current[1] = el)}
            className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal"
          >
            {CLUB_INFO.about.description}
          </p>

          <p
            ref={(el) => (textLinesRef.current[2] = el)}
            className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-mono"
          >
            {CLUB_INFO.about.subtext}
          </p>
        </div>

        {/* Right Brace */}
        <div
          ref={rightBraceRef}
          className="text-7xl sm:text-8xl md:text-9xl font-mono text-zinc-600 font-light select-none tracking-tighter"
          aria-hidden="true"
        >
          &#125;
        </div>
      </div>
    </section>
  );
}
