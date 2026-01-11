
import React from 'react';
import { FileText, Printer, Wind, Calendar, Clock, MapPin, Users, Plane } from 'lucide-react';

export interface MissionData {
  launchTime: string;
  passengers: string;
  balloon: string;
  location: string;
  pilot: string;
  date: string;
}

interface MissionExportButtonProps {
  data: MissionData;
}

export const MissionExportButton: React.FC<MissionExportButtonProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button 
        onClick={handlePrint}
        className="w-full py-3 border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
      >
        <FileText size={18} className="group-hover:scale-110 transition-transform" />
        Export Flight Manifest
      </button>

      {/* Hidden Printable Area */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999]">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-manifest, #printable-manifest * { visibility: visible; }
            #printable-manifest { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              height: 100%;
              background: white !important;
              color: black !important;
            }
            @page { size: auto; margin: 0; }
          }
        `}</style>
        
        <div id="printable-manifest" className="flex flex-col h-full bg-white font-sans p-10 border-[12px] border-slate-100">
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-black p-1.5 rounded-lg text-white">
                  <Wind size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">FreeSun</h1>
              </div>
              <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Aeronautical Operations Unit</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Flight Mission Manifest</h2>
              <p className="text-sm font-mono text-slate-500">ID: FS-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Mission Date</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Calendar size={20} /> {data.date}
                </div>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Launch Window</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Clock size={20} /> {data.launchTime}
                </div>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Launch Site</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <MapPin size={20} /> {data.location}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Assigned Balloon</p>
                <div className="flex items-center gap-2 text-xl font-bold uppercase">
                  <Plane size={20} /> {data.balloon}
                </div>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Passenger Count</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Users size={20} /> {data.passengers}
                </div>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Commanding Pilot</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  {data.pilot}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Verification Block */}
          <div className="mt-auto border-2 border-black p-8 rounded-2xl bg-slate-50">
            <h3 className="text-lg font-black uppercase mb-4 border-b border-black pb-2">Safety Certification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-black rounded" /> <span className="text-sm font-bold">Pre-Flight Inspection Complete</span></div>
              <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-black rounded" /> <span className="text-sm font-bold">Weather Minimums Verified</span></div>
              <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-black rounded" /> <span className="text-sm font-bold">Fuel Reserves Inspection Complete</span></div>
              <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-black rounded" /> <span className="text-sm font-bold">Passenger Safety Briefing Logged</span></div>
            </div>
            <div className="mt-8 pt-8 border-t border-black/20 flex justify-between items-end">
              <div className="w-64 h-px bg-black/40 relative">
                <span className="absolute top-2 left-0 text-[10px] font-bold uppercase text-slate-400">Pilot Signature</span>
              </div>
              <div className="w-64 h-px bg-black/40 relative">
                <span className="absolute top-2 left-0 text-[10px] font-bold uppercase text-slate-400">Ground Crew Chief</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Generated via FreeSun Cloud Services • Elevate Your Perspective</p>
          </div>
        </div>
      </div>
    </>
  );
};
