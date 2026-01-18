
import React from 'react';
import { Plane, Users, Timer, ShieldX, FileCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { SparkleIcon, Spinner } from './StatusUI';
import { MissionExportButton } from './ExportUI';

interface BriefingUIProps {
  pilotContext: {
    passengers: string;
    balloon: string;
    duration: string;
  };
  setPilotContext: (context: any) => void;
  constraints: string;
  setConstraints: (val: string) => void;
  onGenerateBriefing: () => void;
  loadingBriefing: boolean;
  briefing: string | null;
  // Manifest props
  isManifestGenerated: boolean;
  isGeneratingManifest: boolean;
  onGenerateManifest: () => void;
  onResetManifest: () => void;
  missionData: any;
}

export const BriefingCard: React.FC<BriefingUIProps> = ({
  pilotContext,
  setPilotContext,
  constraints,
  setConstraints,
  onGenerateBriefing,
  loadingBriefing,
  briefing,
  isManifestGenerated,
  isGeneratingManifest,
  onGenerateManifest,
  onResetManifest,
  missionData
}) => {
  return (
    <div id="briefing-section" className="bg-card border dark:border-primary/30 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col gap-8 shadow-xl">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <SparkleIcon /> Mission Command Briefing
          </h3>
          <p className="text-sm text-muted-foreground italic">AI-assisted risk assessment & flight manifest generation.</p>
        </div>
        <button 
          onClick={onGenerateBriefing} 
          disabled={loadingBriefing} 
          className="bg-primary text-white whitespace-nowrap text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
        >
          {loadingBriefing ? 'Synthesizing...' : 'Update Briefing'}
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 flex items-center gap-1">
            <Plane size={12} /> Vessel
          </label>
          <select 
            value={pilotContext.balloon} 
            onChange={(e) => setPilotContext({...pilotContext, balloon: e.target.value})} 
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          >
            <option>SunChaser #04 (Medium)</option>
            <option>DawnRider #01 (Small)</option>
            <option>Atlas #09 (Large)</option>
            <option>SkyGazer #02 (XL)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 flex items-center gap-1">
            <Users size={12} /> Manifest
          </label>
          <select 
            value={pilotContext.passengers} 
            onChange={(e) => setPilotContext({...pilotContext, passengers: e.target.value})} 
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          >
            <option>1 (Private)</option>
            <option>2 (Couple)</option>
            <option>4 (Standard)</option>
            <option>6 (Group)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 flex items-center gap-1">
            <Timer size={12} /> Est. Duration
          </label>
          <select 
            value={pilotContext.duration} 
            onChange={(e) => setPilotContext({...pilotContext, duration: e.target.value})} 
            className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          >
            <option value="45">45 Min</option>
            <option value="60">60 Min</option>
            <option value="90">90 Min</option>
            <option value="120">120 Min</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <label className="text-[10px] uppercase tracking-widest font-black text-destructive ml-1 flex items-center gap-1">
          <ShieldX size={12} /> Safety Constraints & No-Fly Zones
        </label>
        <textarea 
          placeholder="e.g. Avoid high-traffic corridor north of reservoir, stay below 3000ft near airfield..."
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          className="w-full bg-muted/50 border border-destructive/10 dark:border-destructive/30 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-destructive/20 outline-none transition-all min-h-[100px] resize-none italic"
        />
      </div>

      {/* Briefing Content */}
      <div className="bg-background/80 backdrop-blur p-8 rounded-[2rem] border-2 border-dashed dark:border-primary/20 min-h-[160px] flex flex-col shadow-inner">
        {briefing ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{briefing}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8 grow">
            <Plane className="text-primary/20 mb-3 animate-float" size={40} />
            <p className="text-muted-foreground text-sm italic max-w-xs">
              Briefing results and safety checks will appear here after analysis.
            </p>
          </div>
        )}
      </div>

      {/* Manifest Generation Section (New Placement) */}
      <div className="pt-6 border-t dark:border-primary/30">
        {isManifestGenerated ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex-grow flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-4 rounded-2xl w-full">
              <ShieldCheck className="text-green-600" size={24} />
              <div className="text-left">
                <div className="text-xs font-black uppercase text-green-600 tracking-widest">Flight ID: {missionData.id || 'AUTH-001'}</div>
                <div className="text-sm font-bold text-green-700">Manifest Sealed & Authorized</div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <MissionExportButton data={missionData} />
              <button 
                onClick={onResetManifest}
                className="p-4 bg-muted hover:bg-muted/80 rounded-2xl text-muted-foreground transition-all"
                title="Edit Manifest"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={onGenerateManifest}
            disabled={isGeneratingManifest || !briefing}
            className={`w-full py-5 font-black text-xl rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
              briefing 
                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
          >
            {isGeneratingManifest ? <Spinner className="text-white" /> : <FileCheck size={24} />}
            {isGeneratingManifest ? 'Generating Manifest...' : 'Generate Manifest'}
          </button>
        )}
        {!briefing && !isManifestGenerated && (
          <p className="text-[10px] text-center mt-3 text-muted-foreground font-bold uppercase tracking-widest italic animate-pulse">
            Analyze flight briefing first to enable manifest generation.
          </p>
        )}
      </div>
    </div>
  );
};
