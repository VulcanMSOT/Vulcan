import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeCanvas from './3d/ForgeCanvas';
import QuietEmberBackground from './QuietEmberBackground';
import IntroScene from './IntroScene';
import FormSteps from './FormSteps';
import SuccessScene from './SuccessScene';
import LoadingScreen from './LoadingScreen';
import { submitEnrollment } from '../../lib/enrollmentApi';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function EnrollmentPage() {
  const [sceneState, setSceneState] = useState('intro'); // 'intro' | 'form' | 'submitting' | 'success'
  const [step, setStep] = useState(1);
  const [_loading, setLoading] = useState(true);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 1. Dynamic SEO & Noindex Meta Guard
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Vulcan Club Enrollment 2026 | Private Preview';

    // Inject <meta name="robots" content="noindex, nofollow">
    let metaRobots = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
      created = true;
    }
    const prevContent = metaRobots.getAttribute('content');
    metaRobots.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = prevTitle;
      if (created && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (prevContent) {
        metaRobots.setAttribute('content', prevContent);
      } else {
        metaRobots.removeAttribute('content');
      }
    };
  }, []);

  // 2. Mouse Parallax Tracker
  const handleMouseMove = useCallback((e) => {
    if (prefersReducedMotion) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    setMousePosition({ x, y });
  }, [prefersReducedMotion]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // 3. Form Submission Handler
  const handleSubmit = async (formData) => {
    setSceneState('submitting');
    setSubmissionError(null);

    try {
      // Artificial delay to let the dramatic hammer/forging animation play out
      const [res] = await Promise.all([
        submitEnrollment(formData),
        new Promise((r) => setTimeout(r, 1400)),
      ]);

      setSubmissionResult(res);
      setSceneState('success');
    } catch (err) {
      console.error('Enrollment error:', err);
      setSubmissionError(err.message || 'Failed to submit enrollment.');
      setSceneState('form');
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setSubmissionError(null);
    setStep(1);
    setSceneState('intro');
  };

  return (
    <div className="relative w-full min-h-screen bg-vulcan-bg text-white overflow-x-hidden selection:bg-vulcan-gold/25 selection:text-vulcan-gold">
      {/* 1. Cinematic Loading Screen while 3D environment initializes */}
      <LoadingScreen onLoaded={() => setLoading(false)} minDuration={2800} />

      {/* 2. Unified "Quiet Ember" Premium Background (Layer z-0) */}
      <QuietEmberBackground
        sceneState={sceneState}
        prefersReducedMotion={prefersReducedMotion}
        isMobile={isMobile}
      />

      {/* 3. Interactive 3D Canvas Scene (Layer z-10) */}
      <ForgeCanvas
        sceneState={sceneState}
        step={step}
        prefersReducedMotion={prefersReducedMotion}
        mousePosition={mousePosition}
      />

      {/* 4. Top Minimal Navigation Bar (when past intro) */}
      <AnimatePresence>
        {sceneState !== 'intro' && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-auto backdrop-blur-md bg-vulcan-bg/60 border-b border-vulcan-border/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <img
                src="/assets/vulcan-logo.png"
                alt="Vulcan emblem"
                className="w-6 h-6 object-contain"
              />
              <span className="font-sans font-bold text-sm tracking-tight text-white lowercase">
                vulcan club
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] text-vulcan-textMuted uppercase tracking-wider px-2 py-0.5 rounded border border-vulcan-border bg-vulcan-card">
                Enrollment 2026
              </span>
            </div>

            <div className="flex items-center gap-3">
              {sceneState === 'form' && (
                <button
                  type="button"
                  onClick={() => setSceneState('intro')}
                  className="font-mono text-xs text-vulcan-textMuted hover:text-white transition-colors cursor-pointer px-2.5 py-1"
                >
                  ← Exit to Intro
                </button>
              )}
              <a
                href="/"
                className="font-mono text-xs text-vulcan-gold hover:text-vulcan-gold-light transition-colors"
              >
                Main Site ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Submission Error Toast */}
      {submissionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-sans shadow-2xl flex items-center gap-2">
          <span>⚠️ {submissionError}</span>
          <button
            type="button"
            onClick={() => setSubmissionError(null)}
            className="ml-2 font-bold hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 6. Active Experience Scenes */}
      <div className="relative z-20 w-full min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {sceneState === 'intro' && (
            <motion.div
              key="intro-scene"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <IntroScene
                onBegin={() => setSceneState('form')}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}

          {(sceneState === 'form' || sceneState === 'submitting') && (
            <motion.div
              key="form-scene"
              className="w-full pt-16"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <FormSteps
                onSubmit={handleSubmit}
                isSubmitting={sceneState === 'submitting'}
                onStepChange={setStep}
              />
            </motion.div>
          )}

          {sceneState === 'success' && (
            <motion.div
              key="success-scene"
              className="w-full pt-16"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SuccessScene
                result={submissionResult}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

