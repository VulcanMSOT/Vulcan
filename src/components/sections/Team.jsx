import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TEAM } from '../../content';
import { SectionHeader, DrawLine, CardNumber } from '../ui/Reveal';

function TeamCard({ member, index, prefersReducedMotion }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-80px' });
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
      className="flex flex-col space-y-4 group"
      style={{ perspective: 1000 }}
    >
      {/* Photo Frame with Emil Kowalski clip-path mask reveal & inner parallax */}
      <div
        className="relative aspect-square w-full rounded-xl overflow-hidden bg-vulcan-card border border-vulcan-border group-hover:border-vulcan-gold/40 transition-all duration-300 shadow-md"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease',
        }}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-vulcan-surface via-vulcan-card to-vulcan-bg"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{
            clipPath: isInView || prefersReducedMotion ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
          }}
          transition={{
            duration: 0.75,
            delay: index * 0.08,
            ease: [0.23, 1, 0.32, 1], // Emil strong ease-out
          }}
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            /* Architectural Avatar Placeholder */
            <div className="flex flex-col items-center justify-center gap-2 select-none">
              <div className="w-14 h-14 rounded-full border border-vulcan-border flex items-center justify-center font-mono text-xl text-zinc-500 group-hover:border-vulcan-gold/50 group-hover:text-vulcan-gold transition-colors duration-200">
                <CardNumber
                  delay={index * 0.08}
                  prefersReducedMotion={prefersReducedMotion}
                  className="text-zinc-500 group-hover:text-vulcan-gold"
                >
                  0{index + 1}
                </CardNumber>
              </div>
              <span className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
                team member
              </span>
            </div>
          )}

          {/* Hover Gold Corner Accent */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="block w-1.5 h-1.5 bg-vulcan-gold shadow-[0_0_6px_#F5A623]" />
          </div>
        </motion.div>
      </div>

      {/* Name and Role Under Each */}
      <div className="space-y-1">
        <h3 className="font-semibold text-base text-white tracking-tight group-hover:text-zinc-100 transition-colors">
          {member.name}
        </h3>
        <p className="font-mono text-xs text-vulcan-textMuted tracking-tight">
          {member.role}
        </p>
      </div>
    </div>
  );
}

export default function Team({ prefersReducedMotion }) {
  return (
    <section
      id="team"
      className="relative w-full py-28 px-6 bg-vulcan-bg"
    >
      {/* Top Section Divider */}
      <div className="max-w-6xl mx-auto mb-20">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header with mask reveal */}
        <SectionHeader
          label="collective members"
          title="Team"
          description="Core members and contributors behind club operations and project development."
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {TEAM.map((member, index) => (
            <TeamCard
              key={member.id}
              member={member}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
