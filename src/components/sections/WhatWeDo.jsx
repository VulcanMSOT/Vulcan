import { motion } from 'framer-motion';
import { Terminal, GitPullRequest, Compass, Cpu, Layers } from 'lucide-react';
import { WHAT_WE_DO } from '../../content';

const ICONS = {
  hackathons: Terminal,
  'open-source': GitPullRequest,
  guidance: Compass,
  'competitive-programming': Cpu,
  'project-building': Layers,
};

export default function WhatWeDo({ prefersReducedMotion }) {
  return (
    <section
      id="what-we-do"
      className="relative w-full py-28 px-6 bg-vulcan-bg border-t border-vulcan-border/30"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs text-vulcan-gold uppercase tracking-widest font-medium">
            core pillars
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            What we do
          </h2>
          <p className="text-sm text-vulcan-textMuted max-w-lg">
            Five core technical disciplines that form the baseline of club activity.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHAT_WE_DO.map((item, index) => {
            const Icon = ICONS[item.id] || Terminal;
            const isGuidance = item.id === 'guidance';

            return (
              <motion.div
                key={item.id}
                className={`group relative rounded-xl border border-vulcan-border bg-vulcan-card/70 p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-vulcan-gold/50 hover:bg-vulcan-surface/90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(245,166,35,0.08)] ${
                  isGuidance ? 'lg:col-span-1 border-vulcan-border/80' : ''
                }`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
                whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.06, // Emil Kowalski short stagger (60ms)
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Subtle top gold spark indicator on hover */}
                <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="inline-block w-1.5 h-1.5 bg-vulcan-gold shadow-[0_0_6px_#F5A623]" />
                </div>

                <div className="space-y-5">
                  {/* Card Header: Icon + Number */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-vulcan-surface flex items-center justify-center border border-vulcan-border group-hover:border-vulcan-gold/30 transition-colors duration-200">
                      <Icon className="w-5 h-5 text-zinc-300 group-hover:text-vulcan-gold transition-colors duration-200" />
                    </div>
                    <span className="font-mono text-xs text-vulcan-textFaint group-hover:text-vulcan-textMuted transition-colors">
                      {item.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="text-sm text-vulcan-textMuted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Guidance special achievement highlight note */}
                {isGuidance && item.highlightLine && (
                  <div className="mt-6 pt-4 border-t border-vulcan-border/60">
                    <div className="flex items-start gap-2 text-xs font-mono text-vulcan-gold">
                      <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold mt-1 shrink-0" />
                      <p className="leading-snug">{item.highlightLine}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
