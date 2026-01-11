
import React from 'react';
import { MessageSquareText, Plane, Users, Timer, AlertOctagon } from 'lucide-react';
import { SparkleIcon, Spinner } from './StatusUI';

interface BriefingUIProps {
  pilotContext: {
    passengers: string;
    balloon: string;
    duration: string;
  };
  setPilotContext: (context: any) => void;
  constraints: string;
  setConstraints: (val: string) => void;
  onGenerate: () => void;
  loading: boolean;
  briefing: string | null;
}

export const BriefingCard: React.FC<BriefingUIProps> = ({
  pilotContext,
  setPilotContext,
  constraints,
  setConstraints,
  onGenerate,
  loading,
  briefing
}) => {
  return (
    <div className="lg:col-span-2 bg-primary/5 border-primary/20 border-2 rounded-3xl p-6 relative overflow-hidden grid grid-rows-[auto_auto_auto_1fr]">
      <div className="absolute -right-4 -top-4 text-primary/5 pointer-events-none">
        <MessageSquareText size={120} />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <h3 className="text-xl font-bold flex items-center gap-2"><SparkleIcon /> Smart Flight Briefing</h3>
        <button 
          onClick={onGenerate} 
          disabled={loading} 
          className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          {loading && <Spinner size={14} />}
          {loading ? 'Analyzing...' : 'Generate New Briefing'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Plane size={10} /> Balloon Type</label>
          <select 
            value={pilotContext.balloon} 
            onChange={(e) => setPilotContext({...pilotContext, balloon: e.target.value})} 
            className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option>SunChaser #04 (Medium)</option>
            <option>DawnRider #01 (Small)</option>
            <option>Atlas #09 (Large)</option>
            <option>SkyGazer #02 (XL)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Users size={10} /> Passengers</label>
          <select 
            value={pilotContext.passengers} 
            onChange={(e) => setPilotContext({...pilotContext, passengers: e.target.value})} 
            className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option>1 (Private)</option>
            <option>2 (Couple)</option>
            <option>4 (Standard)</option>
            <option>6 (Group)</option>
            <option>8+ (Large Group)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Timer size={10} /> Duration (Min)</label>
          <select 
            value={pilotContext.duration} 
            onChange={(e) => setPilotContext({...pilotContext, duration: e.target.value})} 
            className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
            <option value="90">90 Minutes</option>
            <option value="120">120 Minutes</option>
          </select>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1">
            <AlertOctagon size={10} /> Operational Constraints (Optional Refinement)
          </label>
          <input 
            type="text" 
            placeholder="e.g. Avoid high-traffic areas, no water crossings, stay below 3000ft..."
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="w-full bg-background/50 border border-primary/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur p-5 rounded-2xl border border-primary/30 min-h-[160px] shadow-inner grid place-content-center overflow-y-auto">
        {briefing ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8 w-full">
            <Plane className="text-primary/30 mb-2 animate-bounce" />
            <p className="text-muted-foreground text-sm italic max-w-xs">
              Configure flight details and any safety constraints above to generate your specialized AI briefing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
