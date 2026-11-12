import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Brain,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Loader2,
} from 'lucide-react';
import HeatingProgressBar from './HeatingProgressBar';
import { ENROLLMENT_DOMAINS, ENROLLMENT_CLASSES, ENROLLMENT_COPY } from '../../config/enrollment';

export default function FormSteps({
  onSubmit,
  isSubmitting = false,
  onStepChange,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form State for Exactly the 4 Fields + Anti-Spam
  const [formData, setFormData] = useState({
    name: '',
    classYear: '',
    domains: [],
    whyJoin: '',
    honeypot: '', // bot trap
  });

  const [errors, setErrors] = useState({});
  const formMountTime = useRef(0);
  useEffect(() => {
    formMountTime.current = Date.now();
  }, []);
  const nameInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Focus management on step change
  useEffect(() => {
    if (onStepChange) onStepChange(currentStep);

    if (currentStep === 1) {
      setTimeout(() => nameInputRef.current?.focus(), 250);
    } else if (currentStep === 3) {
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
  }, [currentStep, onStepChange]);

  // Validation Logic
  const validateStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        errs.name = 'Please enter your full name.';
      } else if (formData.name.trim().length < 2) {
        errs.name = 'Name must be at least 2 characters.';
      }

      if (!formData.classYear) {
        errs.classYear = 'Please select your class year.';
      }
    } else if (step === 2) {
      if (!formData.domains || formData.domains.length === 0) {
        errs.domains = 'Select at least one domain (Web Dev, DSA, or PR).';
      }
    } else if (step === 3) {
      const why = formData.whyJoin.trim();
      const min = ENROLLMENT_COPY.characterLimits.whyMin;
      const max = ENROLLMENT_COPY.characterLimits.whyMax;

      if (!why) {
        errs.whyJoin = 'Please write a brief statement on why you want to join.';
      } else if (why.length < min) {
        errs.whyJoin = `Your statement is too short (${why.length}/${min} chars). Give us at least ${min} characters.`;
      } else if (why.length > max) {
        errs.whyJoin = `Your statement exceeds the ${max} character limit (${why.length}/${max} chars).`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      onSubmit({
        ...formData,
        formMountedAt: formMountTime.current,
      });
    }
  };

  // Domain selection toggle
  const toggleDomain = (domainId) => {
    setFormData((prev) => {
      const exists = prev.domains.includes(domainId);
      const updated = exists
        ? prev.domains.filter((d) => d !== domainId)
        : [...prev.domains, domainId];
      return { ...prev, domains: updated };
    });
    if (errors.domains) {
      setErrors((prev) => ({ ...prev, domains: null }));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (currentStep === 1) {
        e.preventDefault();
        handleNext();
      }
    }
  };

  return (
    <div className="relative z-20 w-full max-w-xl mx-auto px-4 py-8 select-none">
      {/* 3D Glassmorphic HUD Container */}
      <motion.div
        className="relative rounded-2xl bg-vulcan-card/85 backdrop-blur-2xl border border-vulcan-gold/25 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,166,35,0.08)] overflow-hidden"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Subtle molten corner glows */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-radial from-[rgba(124,45,18,0.12)] via-transparent to-transparent pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-radial from-[rgba(124,45,18,0.10)] via-transparent to-transparent pointer-events-none blur-2xl" />

        {/* Dynamic Heating Metal Progress Bar */}
        <HeatingProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Views */}
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: NAME & CLASS ================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-vulcan-gold font-bold">
                  Phase 01 // Identity
                </span>
                <h2 className="font-sans text-2xl font-black text-white mt-1">
                  Name the Artisan
                </h2>
                <p className="font-sans text-xs text-vulcan-textMuted mt-1">
                  Enter your official name and academic cohort.
                </p>
              </div>

              {/* Field 1: Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="enrollment-name"
                  className="font-mono text-xs font-semibold text-white/90 flex items-center justify-between"
                >
                  <span>FULL NAME <span className="text-vulcan-gold">*</span></span>
                  {errors.name && (
                    <span className="text-red-400 text-[11px] font-sans flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </span>
                  )}
                </label>

                <div className="relative group">
                  <input
                    ref={nameInputRef}
                    id="enrollment-name"
                    type="text"
                    required
                    placeholder="e.g. Aris Thorne"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 rounded-xl bg-vulcan-surface/90 border border-vulcan-border text-white placeholder-vulcan-textFaint font-sans text-sm focus:outline-none focus:border-vulcan-gold focus:ring-2 focus:ring-vulcan-gold/25 focus:shadow-[0_0_20px_rgba(245,166,35,0.25)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Field 2: Class Year (3D Selectable Cards) */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs font-semibold text-white/90 flex items-center justify-between">
                  <span>CLASS COHORT <span className="text-vulcan-gold">*</span></span>
                  {errors.classYear && (
                    <span className="text-red-400 text-[11px] font-sans flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.classYear}
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ENROLLMENT_CLASSES.map((cls) => {
                    const isSelected = formData.classYear === cls.id;

                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, classYear: cls.id });
                          if (errors.classYear) setErrors({ ...errors, classYear: null });
                        }}
                        className={`group relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-vulcan-surface to-vulcan-card border-vulcan-gold shadow-[0_0_25px_rgba(245,166,35,0.25)]'
                            : 'bg-vulcan-surface/60 border-vulcan-border hover:border-vulcan-borderHover hover:bg-vulcan-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`font-sans font-bold text-sm ${isSelected ? 'text-white' : 'text-vulcan-textMuted group-hover:text-white'}`}>
                            {cls.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-vulcan-gold bg-vulcan-gold text-black shadow-[0_0_8px_#F5A623]'
                                : 'border-vulcan-border'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-vulcan-textFaint">
                          {cls.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: DOMAINS ================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-vulcan-gold font-bold">
                  Phase 02 // Discipline
                </span>
                <h2 className="font-sans text-2xl font-black text-white mt-1">
                  Choose Your Craft
                </h2>
                <p className="font-sans text-xs text-vulcan-textMuted mt-1">
                  Select the domains you want to master in the Vulcan forge (select at least one).
                </p>
                {errors.domains && (
                  <p className="text-red-400 text-xs font-sans mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.domains}
                  </p>
                )}
              </div>

              {/* Field 3: Domains (Multi-Select 3D Chips) */}
              <div className="flex flex-col gap-3">
                {ENROLLMENT_DOMAINS.map((domain) => {
                  const isSelected = formData.domains.includes(domain.id);

                  let Icon = Code;
                  if (domain.id === 'DSA') Icon = Brain;
                  if (domain.id === 'PR') Icon = Megaphone;

                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className={`group relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-vulcan-surface via-vulcan-card to-vulcan-card border-vulcan-gold shadow-[0_0_25px_rgba(245,166,35,0.22)] scale-[1.01]'
                          : 'bg-vulcan-surface/60 border-vulcan-border hover:border-vulcan-borderHover hover:bg-vulcan-surface'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
                          isSelected
                            ? 'bg-vulcan-gold/20 border-vulcan-gold text-vulcan-gold shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                            : 'bg-vulcan-card border-vulcan-border text-vulcan-textMuted group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-sans font-extrabold text-base ${isSelected ? 'text-white' : 'text-white/90'}`}>
                            {domain.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-vulcan-gold bg-vulcan-gold text-black shadow-[0_0_8px_#F5A623]'
                                : 'border-vulcan-border'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-vulcan-gold/90 mt-0.5 font-medium">
                          {domain.tagline}
                        </div>
                        <p className="font-sans text-xs text-vulcan-textMuted mt-1 leading-normal">
                          {domain.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: WHY DO YOU WANT TO JOIN ================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-vulcan-gold font-bold">
                  Phase 03 // Drive
                </span>
                <h2 className="font-sans text-2xl font-black text-white mt-1">
                  Why Vulcan Club?
                </h2>
                <p className="font-sans text-xs text-vulcan-textMuted mt-1">
                  Tell us what you want to forge, build, or conquer. Authenticity beats buzzwords.
                </p>
              </div>

              {/* Field 4: Why Join Textarea */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <label htmlFor="enrollment-why" className="font-semibold text-white/90">
                    STATEMENT OF INTENT <span className="text-vulcan-gold">*</span>
                  </label>
                  {/* Live Character Counter */}
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      formData.whyJoin.length >= 30 && formData.whyJoin.length <= 500
                        ? 'text-vulcan-gold'
                        : formData.whyJoin.length > 500
                        ? 'text-red-400'
                        : 'text-vulcan-textFaint'
                    }`}
                  >
                    {formData.whyJoin.length} / 500 chars (min 30)
                  </span>
                </div>

                <textarea
                  ref={textareaRef}
                  id="enrollment-why"
                  rows={5}
                  required
                  placeholder="Share your goals, what projects you want to build, what you bring to the table, and why you want to forge with Vulcan..."
                  value={formData.whyJoin}
                  onChange={(e) => {
                    setFormData({ ...formData, whyJoin: e.target.value });
                    if (errors.whyJoin) setErrors({ ...errors, whyJoin: null });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-vulcan-surface/90 border border-vulcan-border text-white placeholder-vulcan-textFaint font-sans text-sm focus:outline-none focus:border-vulcan-gold focus:ring-2 focus:ring-vulcan-gold/25 focus:shadow-[0_0_20px_rgba(245,166,35,0.25)] transition-all duration-200 resize-none leading-relaxed"
                />

                {errors.whyJoin && (
                  <span className="text-red-400 text-xs font-sans mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.whyJoin}
                  </span>
                )}
              </div>

              {/* Hidden Bot Honeypot */}
              <input
                type="text"
                name="user_website_url"
                tabIndex="-1"
                autoComplete="off"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="opacity-0 absolute -left-[9999px] pointer-events-none"
                aria-hidden="true"
              />

              {/* Summary Card of Applicant */}
              <div className="p-3.5 rounded-xl border border-vulcan-border bg-vulcan-surface/40 flex items-center justify-between text-xs font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-vulcan-textMuted uppercase text-[10px]">Applicant:</span>
                  <span className="text-white font-bold">{formData.name || 'Anonymous'}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-vulcan-textMuted uppercase text-[10px]">Cohort & Domains:</span>
                  <span className="text-vulcan-gold">
                    {formData.classYear || 'Pending'} • {formData.domains.length > 0 ? formData.domains.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action Toolbar */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-vulcan-border/60">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-vulcan-border text-vulcan-textMuted hover:text-white hover:border-vulcan-borderHover font-mono text-xs tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>
          ) : (
            <div className="text-[11px] font-mono text-vulcan-textFaint">
              STRIKE 01 / 03
            </div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-vulcan-gold text-black font-sans font-bold text-xs tracking-wider hover:bg-vulcan-gold-light hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-black font-sans font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(245,166,35,0.5)] hover:shadow-[0_0_40px_rgba(245,166,35,0.7)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>FORGING APPLICATION...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-black animate-pulse" />
                  <span>STRIKE THE ANVIL & SUBMIT</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

