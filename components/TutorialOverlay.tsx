
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Wind, ListChecks, FileText, Users, HelpCircle } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string; // ID of the element to "spotlight"
}

interface TutorialOverlayProps {
  onClose: () => void;
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to Flight Ops",
    description: "This dashboard is your mission control. We've designed it to provide critical data at a glance, even in the field.",
    icon: <Wind className="text-primary" size={32} />
  },
  {
    title: "Real-time Weather & Alerts",
    description: "Monitor live surface conditions. High-wind warnings and storm cell alerts will appear here automatically if safety thresholds are breached.",
    icon: <Wind className="text-destructive" size={32} />,
    targetId: "weather-section"
  },
  {
    title: "AI Flight Briefing",
    description: "Harness the power of Gemini AI. Input your mission constraints to receive a tailored, safety-focused flight briefing in seconds.",
    icon: <Sparkles className="text-primary" size={32} />,
    targetId: "briefing-section"
  },
  {
    title: "Mission Logistics",
    description: "Seamlessly switch between your checklists, flight logs, and crew directory using the navigation tabs above.",
    icon: <ListChecks className="text-primary" size={32} />,
    targetId: "navigation-tabs"
  },
  {
    title: "Export & Compliance",
    description: "Generate and export official flight manifests for ground crew and local authorities with a single tap.",
    icon: <FileText className="text-primary" size={32} />,
    targetId: "mission-section"
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const step = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md" 
        onClick={handleComplete}
      />

      {/* Tutorial Card */}
      <div className="relative bg-card border shadow-2xl rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="p-4 bg-primary/10 rounded-3xl">
              {step.icon}
            </div>
            <button 
              onClick={handleComplete}
              className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              aria-label="Skip tutorial"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-10 min-h-[140px]">
            <h3 className="text-3xl font-bold tracking-tight italic">
              {step.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`} 
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <ChevronLeft size={18} className="inline mr-1" /> Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Start Flying' : 'Next'}
                {currentStep !== steps.length - 1 && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
