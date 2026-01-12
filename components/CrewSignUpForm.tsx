
import React, { useState } from 'react';
import { User, Mail, Briefcase, Send, ChevronLeft, Globe, FileText } from 'lucide-react';

interface CrewSignUpFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CrewSignUpForm: React.FC<CrewSignUpFormProps> = ({ onBack, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Apply to Join</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <User size={12} /> Full Name
          </label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Jean-Pierre Blanchard"
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Mail size={12} /> Email Address
          </label>
          <input 
            type="email" 
            required 
            placeholder="pilot@example.com"
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
              <Globe size={12} /> Interest
            </label>
            <select className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
              <option>Pilot Track</option>
              <option>Ground Crew</option>
              <option>Recovery Ops</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
              <Briefcase size={12} /> Experience
            </label>
            <select className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
              <option>Novice</option>
              <option>1-3 Years</option>
              <option>4-7 Years</option>
              <option>8+ Years</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <FileText size={12} /> Motivation
          </label>
          <textarea 
            placeholder="Why do you want to fly with FreeSun?"
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Submit Application <Send size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
};
