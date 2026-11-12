import React from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { step: 1, temp: '450°C', label: 'Artisan Identity', desc: 'Name & Class' },
  { step: 2, temp: '850°C', label: 'Selected Craft', desc: 'Domain Choice' },
  { step: 3, temp: '1350°C', label: 'Core Intent', desc: 'Statement of Purpose' },
];

export default function HeatingProgressBar({ currentStep = 1, totalSteps = 3 }) {
  const percentage = Math.min(100, Math.max(10, (currentStep / totalSteps) * 100));
  const currentStage = STAGES[Math.min(currentStep - 1, STAGES.length - 1)] || STAGES[0];

  return (
    <div className="w-full flex flex-col gap-2.5 mb-6">
      {/* Top Header: Current Temperature & Forge State */}
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vulcan-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vulcan-gold" />
          </span>
          <span className="text-vulcan-textMuted uppercase tracking-wider text-[11px]">
            Forge Status:
          </span>
          <span className="text-vulcan-gold font-bold tracking-tight">
            {currentStage.temp} • {currentStage.label.toUpperCase()}
          </span>
        </div>

        <span className="text-vulcan-textFaint text-[11px] tracking-wider">
          PHASE {currentStep} OF {totalSteps}
        </span>
      </div>

      {/* The Heating Molten Metal Bar */}
      <div className="relative w-full h-2 bg-vulcan-surface rounded-full overflow-hidden border border-vulcan-border/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: 'linear-gradient(90deg, #991b1b 0%, #dc2626 30%, #ea580c 60%, #f59e0b 85%, #fef08a 100%)',
            boxShadow: '0 0 16px rgba(245, 166, 35, 0.75), 0 0 6px rgba(239, 68, 68, 0.9)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Leading white-hot ember spark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_#FFFFFF] animate-pulse" />
        </motion.div>
      </div>

      {/* Subtle Step Pips */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        {STAGES.map((s) => {
          const isActive = currentStep >= s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div key={s.step} className="flex flex-col gap-0.5">
              <span
                className={`font-mono text-[10px] tracking-wider uppercase transition-colors duration-200 ${
                  isCurrent
                    ? 'text-vulcan-gold font-bold'
                    : isActive
                    ? 'text-white/80'
                    : 'text-vulcan-textFaint'
                }`}
              >
                0{s.step}. {s.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

