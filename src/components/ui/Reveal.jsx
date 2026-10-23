import { motion } from 'framer-motion';

/**
 * Emil Kowalski custom ease curve
 * Strong ease-out: starts fast, lands with high physical precision
 */
export const EMIL_EASE = [0.23, 1, 0.32, 1];

/**
 * Section Label: Gold uppercase micro-text that slides in from left
 * with a short accent line drawing out beside it.
 */
export function SectionLabel({ children, className = '', prefersReducedMotion }) {
  if (prefersReducedMotion) {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <span className="font-mono text-xs text-vulcan-gold uppercase tracking-widest font-medium">
          {children}
        </span>
        <span className="inline-block h-px bg-vulcan-gold/60 w-8" />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <motion.span
        className="font-mono text-xs text-vulcan-gold uppercase tracking-widest font-medium"
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: EMIL_EASE }}
      >
        {children}
      </motion.span>
      <motion.span
        className="inline-block h-px bg-vulcan-gold/60 w-8"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.1, ease: EMIL_EASE }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}

/**
 * Mask Heading: Line-by-line mask reveal rising from behind an overflow-clipped container.
 */
export function MaskHeading({
  children,
  as: Component = 'h2',
  className = '',
  delay = 0.05,
  prefersReducedMotion,
}) {
  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: '105%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay, ease: EMIL_EASE }}
      >
        <Component className={className}>{children}</Component>
      </motion.div>
    </div>
  );
}

/**
 * Fade Paragraph: Fade in with a small upward move (16px) and a tiny blur that clears.
 */
export function FadeParagraph({
  children,
  className = '',
  delay = 0.15,
  prefersReducedMotion,
}) {
  if (prefersReducedMotion) {
    return <p className={className}>{children}</p>;
  }

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: EMIL_EASE }}
    >
      {children}
    </motion.p>
  );
}

/**
 * Unified Section Header with Label, Mask Heading, and Paragraph
 */
export function SectionHeader({
  label,
  title,
  description,
  align = 'left',
  className = '',
  prefersReducedMotion,
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`space-y-3 ${
        isCenter ? 'flex flex-col items-center text-center' : ''
      } ${className}`}
    >
      {label && (
        <SectionLabel prefersReducedMotion={prefersReducedMotion}>
          {label}
        </SectionLabel>
      )}

      {title && (
        <MaskHeading
          as="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white"
          prefersReducedMotion={prefersReducedMotion}
        >
          {title}
        </MaskHeading>
      )}

      {description && (
        <FadeParagraph
          className={`text-sm text-vulcan-textMuted leading-relaxed max-w-lg ${
            isCenter ? 'mx-auto' : ''
          }`}
          prefersReducedMotion={prefersReducedMotion}
        >
          {description}
        </FadeParagraph>
      )}
    </div>
  );
}

/**
 * DrawLine: Divider line that draws from left to right
 */
export function DrawLine({ className = '', delay = 0, prefersReducedMotion }) {
  if (prefersReducedMotion) {
    return <div className={`h-px bg-vulcan-border/60 w-full ${className}`} />;
  }

  return (
    <motion.div
      className={`h-px bg-vulcan-border/60 w-full ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EMIL_EASE }}
      style={{ transformOrigin: 'left' }}
    />
  );
}

/**
 * Card Number: Quick 3D flip / rotateX into place
 */
export function CardNumber({ children, delay = 0, prefersReducedMotion, className = '' }) {
  if (prefersReducedMotion) {
    return <span className={`font-mono text-xs ${className}`}>{children}</span>;
  }

  return (
    <div style={{ perspective: 400 }} className="inline-block">
      <motion.span
        className={`font-mono text-xs inline-block ${className}`}
        initial={{ rotateX: -90, opacity: 0 }}
        whileInView={{ rotateX: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay, ease: EMIL_EASE }}
      >
        {children}
      </motion.span>
    </div>
  );
}

/**
 * Card Icon: Short soft pop after card appears
 */
export function CardIcon({ children, delay = 0, prefersReducedMotion, className = '' }) {
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ scale: 0.65, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay, ease: EMIL_EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Corner Pixels that pop out from top-right corner when card enters
 */
function CornerEmberPixels({ delay = 0, prefersReducedMotion }) {
  if (prefersReducedMotion) return null;

  return (
    <div className="absolute top-2.5 right-2.5 pointer-events-none z-10" aria-hidden="true">
      {/* Pixel 1 */}
      <motion.span
        className="absolute w-1 h-1 bg-vulcan-gold rounded-[0.5px] shadow-[0_0_4px_#F5A623]"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        whileInView={{
          x: [0, 8, 12],
          y: [0, -6, -9],
          opacity: [0, 0.95, 0],
          scale: [0.5, 1, 0],
        }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: delay + 0.25, ease: EMIL_EASE }}
      />
      {/* Pixel 2 */}
      <motion.span
        className="absolute w-1 h-1 bg-vulcan-gold-light rounded-[0.5px] shadow-[0_0_4px_#F5A623]"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        whileInView={{
          x: [0, 4, 7],
          y: [0, -9, -13],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1, 0],
        }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, delay: delay + 0.3, ease: EMIL_EASE }}
      />
    </div>
  );
}

/**
 * Reveal Card:
 * - Staggered rise with fade, starting from 0.95 scale
 * - Self-drawing thin gold border SVG
 * - Corner gold pixel pops
 * - Hover state lift with gold edge highlight
 */
export function RevealCard({
  children,
  index = 0,
  className = '',
  prefersReducedMotion,
  style = {},
  ...props
}) {
  const delay = index * 0.08; // Emil short stagger (80ms)

  if (prefersReducedMotion) {
    return (
      <div
        className={`group relative rounded-xl border border-vulcan-border bg-vulcan-card/85 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-vulcan-gold/50 hover:bg-vulcan-surface hover:shadow-[0_12px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(245,166,35,0.1)] ${className}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`group relative rounded-xl border border-vulcan-border bg-vulcan-card/85 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-vulcan-gold/50 hover:bg-vulcan-surface hover:shadow-[0_12px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(245,166,35,0.1)] ${className}`}
      style={style}
      initial={{ opacity: 0, y: 22, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.48, delay, ease: EMIL_EASE }}
      {...props}
    >
      {/* Corner gold pixels popping out on entry */}
      <CornerEmberPixels delay={delay} prefersReducedMotion={prefersReducedMotion} />

      {/* Thin gold border that draws itself around the card as it enters */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden"
        aria-hidden="true"
      >
        <motion.rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="12"
          fill="none"
          stroke="#F5A623"
          strokeWidth="1"
          strokeOpacity="0.4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, delay: delay + 0.12, ease: EMIL_EASE }}
        />
      </svg>

      {children}
    </motion.div>
  );
}
