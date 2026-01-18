
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Users, Wind, Radio, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CrewTutorialOverlayProps {
  onClose: () => void;
}

const crewSteps: TutorialStep[] = [
  {
    title: "Ground Ops Command",
    description: "Welcome to the Crew Portal. This is where you coordinate launches, manage your availability, and stay in sync with pilots.",
    icon: <Users className="text-primary" size={32} />
  },
  {
    title: "Mission Ready Status",
    description: "Use the Availability Toggle to let the Safety Officer know you're ready for deployment. Green means you're active and eligible for flight assignments.",
    icon: <CheckCircle2 className="text-green-500" size={32} />
  },
  {
    title: "Safety First",
    description: "Balloons are at the mercy of the wind. We provide live weather data so you can anticipate landing conditions and coordinate recovery vehicles safely.",
    icon: <Wind className="text-primary" size={32} />
  },
  {
    title: "Mission Logistics",
    description: "Your active assignments appear in the sidebar. Tap 'View Mission Logistics' to see specific landing site coordinates and passenger manifests.",
    icon: <ShieldAlert className="text-primary" size={32} />
  },
  {
    title: "Crew Connect",
    description: "Need to reach a pilot? Use the Connect tool to start a secure radio-link or find contact details for anyone in the FreeSun fleet.",
    icon: <Radio className="text-primary" size={32} />
  }
];

export const CrewTutorialOverlay: React.FC<CrewTutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < crewSteps.length - 1) {
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

  const step = crewSteps[currentStep];

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md" 
        onClick={handleComplete}
      />

      <div className="relative bg-card border dark:border-primary/30 shadow-2xl rounded-[3rem] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / crewSteps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-10">
            <div className="p-5 bg-primary/10 rounded-3xl">
              {step.icon}
            </div>
            <button 
              onClick={handleComplete}
              className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 mb-12 min-h-[160px]">
            <h3 className="text-4xl font-black tracking-tight italic">
              {step.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed italic">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {crewSteps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} 
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
              >
                {currentStep === crewSteps.length - 1 ? 'End Briefing' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
