import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { ENROLLMENT_COPY } from '../../config/enrollment';

export default function SuccessScene({
  result,
  onReset,
}) {
  const [copied, setCopied] = useState(false);
  const data = result?.data || {};
  const refId = result?.referenceId || 'VLC-2026-FORGE';

  const copyRefId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative z-20 w-full max-w-xl mx-auto px-4 py-12 select-none">
      <motion.div
        className="relative rounded-2xl bg-vulcan-card/90 backdrop-blur-2xl border border-vulcan-gold/40 p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(245,166,35,0.2)] text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Top Molten Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-radial from-[rgba(124,45,18,0.25)] via-[rgba(124,45,18,0.08)] to-transparent blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <motion.div
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-black mb-6 shadow-[0_0_30px_rgba(245,166,35,0.5)]"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.15 }}
        >
          <Sparkles className="w-8 h-8 text-black fill-black" />
        </motion.div>

        {/* Celebration Headline */}
        <motion.h2
          className="font-sans font-black text-2xl sm:text-4xl text-white tracking-tight uppercase"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {ENROLLMENT_COPY.successHeadline}
        </motion.h2>

        <motion.p
          className="font-sans text-sm text-vulcan-textMuted max-w-md mx-auto mt-2 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {ENROLLMENT_COPY.successSub}
        </motion.p>

        {/* Candidate Reference Badge Card */}
        <motion.div
          className="my-8 p-5 rounded-xl border border-vulcan-border bg-vulcan-surface/70 text-left font-mono text-xs flex flex-col gap-3 shadow-inner"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {/* Reference ID Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-vulcan-border/60">
            <span className="text-vulcan-textMuted text-[11px] uppercase tracking-wider">
              ENROLLMENT REFERENCE:
            </span>
            <button
              type="button"
              onClick={copyRefId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-vulcan-card border border-vulcan-border hover:border-vulcan-gold text-vulcan-gold font-bold transition-all cursor-pointer"
              title="Copy Reference ID"
            >
              <span>{refId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-vulcan-textFaint block uppercase text-[10px]">Candidate:</span>
              <strong className="text-white font-sans text-sm">{data.name || 'Artisan'}</strong>
            </div>

            <div>
              <span className="text-vulcan-textFaint block uppercase text-[10px]">Cohort:</span>
              <strong className="text-vulcan-gold">{data.classYear || 'Class of 2029'}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-vulcan-textFaint block uppercase text-[10px]">Chosen Craft:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(data.domains || []).map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-full border border-vulcan-gold/30 bg-vulcan-gold/10 text-vulcan-gold text-[10px] font-sans font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-vulcan-gold text-black font-sans font-bold text-xs tracking-wider hover:bg-vulcan-gold-light hover:shadow-[0_0_25px_rgba(245,166,35,0.4)] transition-all cursor-pointer"
          >
            <span>RETURN TO MAIN SITE</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-vulcan-border text-vulcan-textMuted hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer"
            >
              Submit Another Response
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

