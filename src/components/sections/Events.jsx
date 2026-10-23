import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { EVENTS } from '../../content';
import {
  SectionHeader,
  RevealCard,
  CardNumber,
  DrawLine,
} from '../ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

export default function Events({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current) return;

    // Only apply horizontal pin on viewports wider than mobile
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const track = trackRef.current;
      const getScrollAmount = () => track.scrollWidth - window.innerWidth + 80;

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="events"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-vulcan-bg py-24 flex flex-col justify-center overflow-hidden"
    >
      {/* Top Section Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 mb-16">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Section Header with mask reveal */}
      <div className="max-w-6xl mx-auto w-full px-6 mb-12">
        <SectionHeader
          label="timeline & milestones"
          title="Club events"
          description="Internal sprints, architecture workshops, and competitive sessions."
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        className="flex gap-6 px-6 md:px-16 w-full overflow-x-auto md:overflow-visible no-scrollbar pb-6 md:pb-0"
      >
        {EVENTS.map((event, index) => (
          <RevealCard
            key={event.id}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
            className="w-[300px] sm:w-[360px] md:w-[420px] shrink-0 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Date & Index */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-vulcan-surface border border-vulcan-border font-mono text-xs text-vulcan-gold">
                  <Calendar className="w-3.5 h-3.5 text-vulcan-gold" />
                  <span>{event.date}</span>
                </div>

                <CardNumber
                  delay={index * 0.08}
                  prefersReducedMotion={prefersReducedMotion}
                  className="text-vulcan-textFaint"
                >
                  0{index + 1}
                </CardNumber>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-vulcan-textMuted leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Optional Link / Footer Action with animated underline */}
            <div className="mt-8 pt-4 border-t border-vulcan-border/60 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Internal Session</span>
              {event.link ? (
                <a
                  href={event.link}
                  className="inline-flex items-center gap-1 text-vulcan-gold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-vulcan-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
                >
                  Details <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-vulcan-textFaint">[optional link]</span>
              )}
            </div>
          </RevealCard>
        ))}
      </div>
    </section>
  );
}
