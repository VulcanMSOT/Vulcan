import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, ArrowUpRight } from 'lucide-react';
import ClosingCanvas from '../3d/ClosingCanvas';
import { CLUB_INFO } from '../../content';
import { MaskHeading, FadeParagraph, DrawLine } from '../ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

export default function Closing({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const [convergenceProgress, setConvergenceProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) {
      setConvergenceProgress(1);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      end: 'center center',
      scrub: 0.6,
      onUpdate: (self) => {
        setConvergenceProgress(self.progress);
      },
    });

    return () => st.kill();
  }, [prefersReducedMotion]);

  return (
    <section
      id="closing"
      ref={sectionRef}
      className="relative w-full py-28 px-6 bg-vulcan-bg overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* Top Section Divider */}
      <div className="max-w-4xl mx-auto w-full mb-16">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* 3D Canvas with Converging Pixels */}
      <div className="w-full max-w-md h-56 sm:h-64 mx-auto mb-8 relative">
        {/* Ambient Vulcan Orange Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-44 sm:h-52 bg-[#ff7a1a]/[0.12] rounded-full blur-[85px] pointer-events-none"
          aria-hidden="true"
        />
        <ClosingCanvas
          progress={convergenceProgress}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Mask Heading & Fade Paragraph */}
      <div className="max-w-xl mx-auto space-y-4 mb-10 z-10 flex flex-col items-center">
        <MaskHeading
          as="h2"
          className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white"
          prefersReducedMotion={prefersReducedMotion}
        >
          Code, systems, and algorithms.
        </MaskHeading>

        <FadeParagraph
          className="text-sm text-vulcan-textMuted font-mono"
          delay={0.15}
          prefersReducedMotion={prefersReducedMotion}
        >
          An engineering collective of students focused on craftsmanship and execution.
        </FadeParagraph>
      </div>

      {/* Contact & Social Links with soft press effect */}
      <div className="flex flex-wrap items-center justify-center gap-4 z-10">
        <a
          href={`mailto:${CLUB_INFO.contact.email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-vulcan-border bg-vulcan-card hover:bg-vulcan-surface hover:border-vulcan-gold/40 text-sm font-medium text-white transition-all duration-160 active:scale-[0.97]"
        >
          <Mail className="w-4 h-4 text-vulcan-gold" />
          <span>{CLUB_INFO.contact.email}</span>
        </a>

        {CLUB_INFO.contact.socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-vulcan-border bg-vulcan-card/60 hover:bg-vulcan-surface hover:border-vulcan-gold/30 text-sm text-zinc-300 transition-all duration-160 active:scale-[0.97]"
          >
            <span>{social.name}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        ))}
      </div>
    </section>
  );
}
