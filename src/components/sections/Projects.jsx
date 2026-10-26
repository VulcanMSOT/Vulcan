import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { PROJECTS } from '../../content';

const EMIL_EASE = [0.23, 1, 0.32, 1];

/**
 * Animated SVG Flow Diagram for Real Project Cards
 * Displays the architectural/operational pipeline steps for the project.
 */
function RealFlowDiagram({ project, prefersReducedMotion, isInView }) {
  const steps = project?.flowSteps || (project?.flow?.map((item, idx) => ({
    id: idx + 1,
    title: item,
    sub: ''
  }))) || [
    { id: 1, title: 'Editor clicks Translate', sub: 'Field-level UI trigger' },
    { id: 2, title: 'Drupal AI Core & provider', sub: 'Dispatches to LLM / service' },
    { id: 3, title: 'Diff preview appears', sub: 'Side-by-side comparison' },
    { id: 4, title: 'Editor applies translation', sub: 'Populates field or CKEditor 5' },
  ];
  const flowTitle = project?.flowTitle || 'Pipeline Flow';

  return (
    <div
      className="w-full my-4 p-4 rounded-xl bg-vulcan-bg/90 border border-vulcan-border/80 overflow-hidden"
      aria-label={`Workflow diagram for ${project?.title || 'project'}: ${steps.map((s) => s.title).join(', ')}.`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-vulcan-border/60">
        <span className="font-mono text-[10px] uppercase tracking-wider text-vulcan-gold/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold animate-pulse" />
          {flowTitle}
        </span>
        <span className="font-mono text-[10px] text-zinc-500">{steps.length} steps</span>
      </div>

      <div className="relative pl-6 space-y-3.5">
        {/* Animated Connecting Vertical Line */}
        <svg
          className="absolute left-2.5 top-2 bottom-2 w-2 h-[calc(100%-16px)] overflow-visible pointer-events-none"
          aria-hidden="true"
        >
          {/* Static track */}
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          {/* Animated drawing line */}
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="#F5A623"
            strokeWidth="1.5"
            strokeDasharray="200"
            strokeDashoffset={prefersReducedMotion ? 0 : isInView ? 0 : 200}
            transition={{ duration: 0.9, ease: EMIL_EASE }}
          />
        </svg>

        {steps.map((step, idx) => {
          const delay = prefersReducedMotion ? 0 : 0.2 + idx * 0.18;
          return (
            <motion.div
              key={step.id}
              className="relative flex items-start gap-3"
              initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.4, delay, ease: EMIL_EASE }}
            >
              {/* Node Indicator */}
              <motion.div
                className="relative -ml-[25px] mt-0.5 w-3.5 h-3.5 rounded-full bg-vulcan-card border flex items-center justify-center shrink-0"
                initial={prefersReducedMotion ? false : { borderColor: 'rgba(255,255,255,0.15)', scale: 0.8 }}
                animate={isInView ? { borderColor: '#F5A623', scale: 1 } : {}}
                transition={{ duration: 0.35, delay: delay + 0.1, ease: EMIL_EASE }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-vulcan-gold"
                  initial={prefersReducedMotion ? false : { opacity: 0.3 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: delay + 0.15 }}
                />
              </motion.div>

              {/* Step Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-vulcan-gold font-semibold">0{step.id}</span>
                  <span className="text-xs font-semibold text-zinc-100 truncate">{step.title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{step.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Empty-State Blueprint Diagram for Placeholder Cards 2 & 3
 * Intentionally designed empty state with dashed vectors and subtle gold pixel markers.
 */
function EmptyBlueprintDiagram() {
  return (
    <div
      className="w-full my-4 p-4 rounded-xl bg-vulcan-bg/40 border border-dashed border-vulcan-border/70 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-vulcan-border/50">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          Pipeline Blueprint
        </span>
        <span className="font-mono text-[10px] text-zinc-600">Pending</span>
      </div>

      <div className="relative pl-6 space-y-3.5">
        {/* Dashed Connecting Line */}
        <svg
          className="absolute left-2.5 top-2 bottom-2 w-2 h-[calc(100%-16px)] overflow-visible pointer-events-none"
          aria-hidden="true"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {[1, 2, 3, 4].map((num, i) => (
          <div key={num} className="relative flex items-center gap-3">
            {/* Hollow Dashed Node */}
            <div className="relative -ml-[25px] w-3.5 h-3.5 rounded-full bg-vulcan-bg border border-dashed border-zinc-700 flex items-center justify-center shrink-0">
              {i === 0 && <span className="w-1 h-1 bg-vulcan-gold/70" />}
            </div>

            {/* Placeholder Bar Lines */}
            <div className="space-y-1.5 flex-1">
              <div
                className="h-2 rounded bg-zinc-800/80 border border-zinc-700/40"
                style={{ width: `${65 - i * 8}%` }}
              />
              <div
                className="h-1.5 rounded bg-zinc-900 border border-zinc-800/50"
                style={{ width: `${45 + (i % 2) * 15}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Project Card Component
 */
function ProjectCard({ project, index, prefersReducedMotion }) {
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Desktop-only 3D mouse tilt
  const handleMouseMove = (e) => {
    if (prefersReducedMotion || typeof window === 'undefined' || window.innerWidth < 1024) return;
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maximum 5.5 degree tilt
    const rotX = ((centerY - y) / centerY) * 5.5;
    const rotY = ((x - centerX) / centerX) * 5.5;

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const isPlaceholder = Boolean(project.isPlaceholder);

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 24 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: EMIL_EASE }}
      style={{
        transform: prefersReducedMotion
          ? 'none'
          : `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 180ms ease-out',
      }}
      className={`group relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 ${
        isPlaceholder
          ? 'bg-vulcan-card/40 border border-dashed border-vulcan-border/70 opacity-65 hover:opacity-85'
          : 'bg-vulcan-card/90 border border-vulcan-border hover:border-vulcan-gold/40 shadow-lg shadow-black/40'
      } ${index === 2 ? 'md:col-span-2 md:max-w-md md:mx-auto lg:col-span-1 lg:max-w-none w-full' : ''}`}
    >
      {/* Soft Moving Glare Highlight (desktop hover) */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 240px at ${glare.x}% ${glare.y}%, rgba(245, 166, 35, 0.3), transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Thin Gold Border That Draws on Enter */}
      {!prefersReducedMotion && !isPlaceholder && (
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx="16"
            fill="none"
            stroke="#F5A623"
            strokeWidth="1.2"
            strokeDasharray="400"
            initial={{ strokeDashoffset: 400 }}
            animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 400 }}
            transition={{ duration: 0.85, delay: index * 0.15 + 0.1, ease: EMIL_EASE }}
          />
        </svg>
      )}

      {/* Tiny Gold Pixel Spark popping near top-right corner */}
      {!prefersReducedMotion && !isPlaceholder && (
        <div className="absolute top-4 right-4 pointer-events-none flex gap-1 z-10" aria-hidden="true">
          <motion.span
            className="w-1 h-1 bg-vulcan-gold"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: [0, 1, 0], y: [0, -6] } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.span
            className="w-1.5 h-1.5 bg-vulcan-gold"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: [0, 1, 0], y: [0, -8] } : {}}
            transition={{ duration: 0.9, delay: 0.4 }}
          />
          <motion.span
            className="w-1 h-1 bg-vulcan-gold"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: [0, 1, 0], y: [0, -5] } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
        </div>
      )}

      {/* Card Header: Large Outlined Number + Tag / Placeholder Badge */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <span
            className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tighter outlined-num select-none leading-none"
            aria-hidden="true"
          >
            {project.number || `0${index + 1}`}
          </span>

          <div className="flex flex-col items-end gap-1.5">
            {isPlaceholder && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
                Placeholder
              </span>
            )}
            <span className="font-mono text-xs text-vulcan-gold/90 font-medium tracking-wide text-right">
              {project.tag}
            </span>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2.5">
          {project.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-vulcan-textMuted leading-relaxed mb-4">
          {project.summary}
        </p>

        {/* Flow Diagram (Real or Empty Blueprint) */}
        {!isPlaceholder ? (
          <RealFlowDiagram project={project} prefersReducedMotion={prefersReducedMotion} isInView={isInView} />
        ) : (
          <EmptyBlueprintDiagram />
        )}

        {/* Expandable "What was built" Section */}
        {!isPlaceholder && project.built && project.built.length > 0 && (
          <div className="my-4">
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={`card-built-${project.id}`}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg bg-vulcan-bg/70 border border-vulcan-border hover:border-vulcan-gold/40 text-xs font-mono text-zinc-200 transition-colors focus-visible:outline-2 focus-visible:outline-vulcan-gold"
            >
              <span className="font-medium text-zinc-200">
                What was built ({project.built.length} items)
              </span>
              <ChevronDown
                className={`w-4 h-4 text-vulcan-gold transition-transform duration-200 ease-emil-out ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              id={`card-built-${project.id}`}
              className={`grid transition-all duration-300 ease-emil-out overflow-hidden ${
                isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="space-y-2 py-1 text-xs text-vulcan-textMuted leading-relaxed">
                  {project.built.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold shrink-0 mt-1.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stack Tags */}
        <div className="flex flex-wrap gap-1.5 my-4">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded bg-vulcan-surface border border-vulcan-border text-[11px] font-mono text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Status, Credit, and Buttons */}
      <div className="pt-4 border-t border-vulcan-border/60 mt-auto space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-vulcan-gold/80" aria-hidden="true" />
            <span>{project.status}</span>
          </div>
          <div className="text-xs font-mono text-vulcan-textFaint">
            {project.credit}
          </div>
        </div>

        {/* Link Buttons */}
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {project.links.map((link) => {
              const isPrimary = link.primary;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group/btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-vulcan-gold ${
                    isPrimary
                      ? 'bg-vulcan-gold text-black hover:bg-vulcan-gold-light shadow-sm shadow-vulcan-gold/20'
                      : 'bg-vulcan-surface border border-vulcan-border text-zinc-200 hover:text-white hover:border-zinc-500'
                  }`}
                  aria-label={`${link.label} (opens in new tab)`}
                >
                  <span>{link.label}</span>
                  <ExternalLink
                    className="w-3.5 h-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/**
 * Projects Section Main Component
 */
export default function Projects({ prefersReducedMotion }) {
  const sectionRef = useRef(null);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full py-28 px-4 sm:px-6 lg:px-8 bg-vulcan-bg overflow-hidden"
      aria-labelledby="projects-heading"
    >
      {/* Top Divider */}
      <div className="max-w-[1200px] mx-auto mb-16 sm:mb-20">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-vulcan-gold/30 to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto space-y-12 sm:space-y-14">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <span className="font-mono text-xs text-vulcan-gold uppercase tracking-widest font-semibold">
              Projects
            </span>
            <span className="inline-block h-px bg-vulcan-gold/50 w-7" aria-hidden="true" />
          </div>

          <h2
            id="projects-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            Things our members have built.
          </h2>

          <p className="text-sm sm:text-base text-vulcan-textMuted max-w-2xl leading-relaxed">
            Real open source modules, tools, and technical contributions engineered by Vulcan members.
          </p>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
