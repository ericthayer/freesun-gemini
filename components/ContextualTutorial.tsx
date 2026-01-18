
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

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

  // Handle mounting animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsMounted(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Update target rectangle when step changes or window resizes
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Small delay to allow scroll to settle before calculating rect
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect());
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, isOpen, steps]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[300] transition-all duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* SVG Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 10}
                y={targetRect.top - 10}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="25"
                fill="black"
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Tutorial Side Drawer (Based on sketch) */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-slate-950 text-white shadow-2xl transition-transform duration-500 ease-out border-l border-white/10 ${isMounted ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-end mb-12">
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X size={28} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
              {step.icon}
            </div>
            
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Step {currentStep + 1} of {steps.length}
              </div>
              <h3 className="text-4xl font-bold tracking-tight leading-tight italic">
                {step.title}
              </h3>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-12 border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`} 
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all text-slate-400"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep !== steps.length - 1 && <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors text-left"
            >
              Skip Onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
