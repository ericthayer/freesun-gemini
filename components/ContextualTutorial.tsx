
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useOnboardingAnalytics } from '../hooks/useOnboardingAnalytics';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ContextualTutorialProps {
  steps: TutorialStep[];
  onClose: () => void;
  isOpen: boolean;
}

export const ContextualTutorial: React.FC<ContextualTutorialProps> = ({ steps, onClose, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const analytics = useOnboardingAnalytics();

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      analytics.trackStart();
    } else {
      setIsMounted(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect());
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    analytics.trackStepView(currentStep + 1, steps[currentStep].title);

    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, isOpen, steps]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        analytics.trackClose(currentStep + 1, steps.length);
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, currentStep, steps.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      analytics.trackComplete(steps.length);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      analytics.trackBack(currentStep + 1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    analytics.trackSkip(currentStep + 1, steps.length);
    onClose();
  };

  const handleClose = () => {
    analytics.trackClose(currentStep + 1, steps.length);
    onClose();
  };

  const step = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[300] transition-all duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="spotlight-glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 24}
                y={targetRect.top - 24}
                width={targetRect.width + 48}
                height={targetRect.height + 48}
                rx="32"
                fill="black"
                className="transition-all duration-500 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#spotlight-mask)" />
        {targetRect && (
          <>
            <rect
              x={targetRect.left - 24}
              y={targetRect.top - 24}
              width={targetRect.width + 48}
              height={targetRect.height + 48}
              rx="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary transition-all duration-500 ease-out animate-pulse"
              style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
            />
            <rect
              x={targetRect.left - 24}
              y={targetRect.top - 24}
              width={targetRect.width + 48}
              height={targetRect.height + 48}
              rx="32"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              className="transition-all duration-500 ease-out"
            />
          </>
        )}
      </svg>

      <div
        className="absolute inset-0 z-10"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-slate-950 text-white shadow-2xl transition-transform duration-500 ease-out border-t-2 border-primary/30 max-h-[85vh] md:max-h-[40vh] overflow-y-auto ${isMounted ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
              {step.icon}
            </div>

            <div className="flex-grow space-y-3 md:space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-primary">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white shrink-0"
                  aria-label="Close tutorial"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight italic">
                {step.title}
              </h3>

              <p className="text-base md:text-lg text-slate-300 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 order-2 sm:order-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-primary/70 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-5 py-3 hover:bg-white/10 rounded-xl transition-all text-slate-300 hover:text-white font-bold text-sm flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-grow sm:flex-grow-0 bg-primary hover:bg-primary/90 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== steps.length - 1 && <ChevronRight size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="mt-4 text-xs font-bold text-slate-500 hover:text-white transition-colors text-center w-full"
          >
            Skip Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};
