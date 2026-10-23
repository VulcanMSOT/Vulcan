import { Terminal, GitPullRequest, Compass, Cpu, Layers } from 'lucide-react';
import { WHAT_WE_DO } from '../../content';
import {
  SectionHeader,
  RevealCard,
  CardNumber,
  CardIcon,
  DrawLine,
} from '../ui/Reveal';

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
      className="relative w-full py-28 px-6 bg-vulcan-bg"
    >
      {/* Top Section Divider drawing from left to right */}
      <div className="max-w-6xl mx-auto mb-20">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header with slide-in label, line-by-line mask heading, and blurred-fade paragraph */}
        <SectionHeader
          label="core pillars"
          title="What we do"
          description="Five core technical disciplines that form the baseline of club activity."
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* 5 Cards Grid with staggered entry, self-drawing gold border & corner ember pops */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHAT_WE_DO.map((item, index) => {
            const Icon = ICONS[item.id] || Terminal;
            const isGuidance = item.id === 'guidance';

            return (
              <RevealCard
                key={item.id}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
                className={`flex flex-col justify-between ${
                  isGuidance ? 'lg:col-span-1 border-vulcan-border/80' : ''
                }`}
              >
                {/* Subtle top gold spark indicator on hover */}
                <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="inline-block w-1.5 h-1.5 bg-vulcan-gold shadow-[0_0_6px_#F5A623]" />
                </div>

                <div className="space-y-5">
                  {/* Card Header: Icon + Number */}
                  <div className="flex items-center justify-between">
                    <CardIcon
                      delay={index * 0.08}
                      prefersReducedMotion={prefersReducedMotion}
                      className="w-10 h-10 rounded-lg bg-vulcan-surface flex items-center justify-center border border-vulcan-border group-hover:border-vulcan-gold/30 transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5 text-zinc-300 group-hover:text-vulcan-gold transition-colors duration-200" />
                    </CardIcon>

                    <CardNumber
                      delay={index * 0.08}
                      prefersReducedMotion={prefersReducedMotion}
                      className="text-vulcan-textFaint group-hover:text-vulcan-textMuted transition-colors"
                    >
                      {item.number}
                    </CardNumber>
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
              </RevealCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
