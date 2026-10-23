import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, ArrowUpRight } from 'lucide-react';
import ClosingCanvas from '../3d/ClosingCanvas';
import { CLUB_INFO } from '../../content';

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
      className="relative w-full py-28 px-6 bg-vulcan-bg border-t border-vulcan-border/30 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* 3D Canvas with Converging Pixels */}
      <div className="w-full max-w-md h-56 sm:h-64 mx-auto mb-8 relative">
        <ClosingCanvas
          progress={convergenceProgress}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Short Line & Information */}
      <div className="max-w-xl mx-auto space-y-4 mb-10 z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Code, systems, and algorithms.
        </h2>
        <p className="text-sm text-vulcan-textMuted font-mono">
          An engineering collective of students focused on craftsmanship and execution.
        </p>
      </div>

      {/* Contact & Social Links (No Join / Apply Buttons!) */}
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-vulcan-border bg-vulcan-card/60 hover:bg-vulcan-surface hover:border-vulcan-borderHover text-sm text-zinc-300 transition-all duration-160 active:scale-[0.97]"
          >
            <span>{social.name}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        ))}
      </div>
    </section>
  );
}
