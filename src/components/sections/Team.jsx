import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useInView } from 'framer-motion';
import { TEAM } from '../../content';
import { SectionHeader, DrawLine, CardNumber } from '../ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.43a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

function CodeforcesIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="10.5" width="4" height="9.5" rx="1" fill="#FFC107" />
      <rect x="10" y="4" width="4" height="16" rx="1" fill="#2196F3" />
      <rect x="16.5" y="7.5" width="4" height="12.5" rx="1" fill="#F44336" />
    </svg>
  );
}

function TeamCard({ member, index, prefersReducedMotion }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.1 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // 3D Tilt on Hover (subtle and responsive)
  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-[205px] sm:w-[220px] md:w-[235px] shrink-0 flex flex-col space-y-2.5 group select-none"
      style={{ perspective: 1000 }}
    >
      {/* Photo Frame with clean, sharp display & subtle 3D tilt */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-vulcan-card border border-vulcan-border group-hover:border-vulcan-gold/50 transition-all duration-300 shadow-xl"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease',
        }}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center bg-vulcan-surface"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{
            clipPath: isInView || prefersReducedMotion ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
          }}
          transition={{
            duration: 0.75,
            delay: index * 0.08,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover object-[center_16%] contrast-[1.02] brightness-[1.02] group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                if (member.fallbackImage && e.target.src !== member.fallbackImage) {
                  e.target.src = member.fallbackImage;
                }
              }}
            />
          ) : (
            /* Architectural Avatar Placeholder */
            <div className="flex flex-col items-center justify-center gap-2 select-none h-full w-full bg-gradient-to-br from-vulcan-surface via-vulcan-card to-vulcan-bg">
              <div className="w-14 h-14 rounded-full border border-vulcan-border flex items-center justify-center font-mono text-xl text-zinc-500 group-hover:border-vulcan-gold/50 group-hover:text-vulcan-gold transition-colors duration-200">
                <CardNumber
                  delay={index * 0.08}
                  prefersReducedMotion={prefersReducedMotion}
                  className="text-zinc-500 group-hover:text-vulcan-gold"
                >
                  {String(index + 1).padStart(2, '0')}
                </CardNumber>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
                team member
              </span>
            </div>
          )}

          {/* Hover Gold Corner Accent */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="block w-2 h-2 bg-vulcan-gold shadow-[0_0_8px_#F5A623]" />
          </div>
        </motion.div>
      </div>

      {/* Name, Role & Social Links */}
      <div className="space-y-1.5">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-base text-white tracking-tight group-hover:text-zinc-100 transition-colors truncate">
            {member.name}
          </h3>
          <p className="font-mono text-[11px] text-vulcan-gold tracking-tight font-medium truncate">
            {member.role}
          </p>
        </div>

        {/* Profile Links */}
        {member.links && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {member.links.github && (
              <a
                href={member.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s GitHub`}
                title="GitHub"
                className="w-7 h-7 rounded-lg bg-vulcan-surface/90 border border-vulcan-border/80 flex items-center justify-center text-zinc-400 hover:text-white hover:border-vulcan-gold/50 hover:bg-vulcan-card transition-all duration-200"
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {member.links.linkedin && (
              <a
                href={member.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s LinkedIn`}
                title="LinkedIn"
                className="w-7 h-7 rounded-lg bg-vulcan-surface/90 border border-vulcan-border/80 flex items-center justify-center text-zinc-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/60 hover:bg-vulcan-card transition-all duration-200"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {member.links.codeforces && (
              <a
                href={member.links.codeforces}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s Codeforces`}
                title="Codeforces"
                className="w-7 h-7 rounded-lg bg-vulcan-surface/90 border border-vulcan-border/80 flex items-center justify-center text-zinc-400 hover:border-vulcan-gold/60 hover:bg-vulcan-card transition-all duration-200"
              >
                <CodeforcesIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Team({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current) return;

    // Apply horizontal pin on viewports wider than mobile
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const track = trackRef.current;
      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollAmount() + window.innerHeight * 0.85}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // 1. Initial hold buffer: Keep section completely stationary on entry
      // so the user first fully sees the section, title, and initial cards
      tl.to({}, { duration: 0.35 });

      // 2. Smoothly glide horizontally across all team cards
      tl.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        duration: 1,
      });

      // 3. Resting buffer at the end before unpinning to next section
      tl.to({}, { duration: 0.25 });

      return () => {
        tl.kill();
      };
    });

    // Refresh triggers to ensure exact geometry calculation
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(timer);
      mm.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative w-full h-screen min-h-[540px] max-h-[820px] bg-vulcan-bg flex flex-col justify-center overflow-hidden py-4 sm:py-6"
    >
      {/* Top Section Divider */}
      <div className="max-w-6xl mx-auto w-full px-6 mb-4 sm:mb-5">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Section Header with mask reveal */}
      <div className="max-w-6xl mx-auto w-full px-6 mb-4 sm:mb-6">
        <SectionHeader
          label="collective members"
          title="Team"
          description="Core members and contributors behind club operations and project development."
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-6 px-6 md:px-16 w-full overflow-x-auto md:overflow-visible no-scrollbar pb-3 md:pb-0"
      >
        {TEAM.map((member, index) => (
          <TeamCard
            key={member.id}
            member={member}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </section>
  );
}

