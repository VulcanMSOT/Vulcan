import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';
import { PROJECTS } from '../../content';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

gsap.registerPlugin(ScrollTrigger);

export default function Projects({ prefersReducedMotion }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        // Emil / Taste parallax: Subtle speed differential per card
        const speed = index % 2 === 0 ? -25 : -45;

        gsap.to(card, {
          y: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full py-28 px-6 bg-vulcan-bg border-t border-vulcan-border/30 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs text-vulcan-gold uppercase tracking-widest font-medium">
            systems & tools
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Projects
          </h2>
          <p className="text-sm text-vulcan-textMuted max-w-lg">
            Engineering architectures, systems software, and utilities engineered by club members.
          </p>
        </div>

        {/* Project Cards (Large with Parallax) */}
        <div className="space-y-10">
          {PROJECTS.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group relative rounded-2xl border border-vulcan-border bg-vulcan-card/90 p-8 sm:p-10 transition-all duration-300 hover:border-vulcan-gold/40 hover:bg-vulcan-surface hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Project Info */}
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-vulcan-gold font-medium uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className="text-zinc-600 font-mono text-xs">•</span>
                    <span className="font-mono text-xs text-zinc-500">
                      SYS-0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm sm:text-base text-vulcan-textMuted leading-relaxed">
                    {project.description}
                  </p>

                  {/* Stack Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md bg-vulcan-bg/80 border border-vulcan-border text-xs font-mono text-zinc-300 group-hover:border-vulcan-borderHover transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-vulcan-border bg-vulcan-bg hover:bg-vulcan-card hover:border-vulcan-gold/50 text-sm font-medium text-white transition-all duration-160 active:scale-[0.97]"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <GithubIcon className="w-4 h-4 text-zinc-300 group-hover:text-vulcan-gold transition-colors" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                </div>
              </div>

              {/* Decorative Corner Accent */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="block w-2 h-2 bg-vulcan-gold/80 shadow-[0_0_8px_#F5A623]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
