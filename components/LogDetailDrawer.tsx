
import React from 'react';
import { Calendar, Timer, MapPin, PlaneTakeoff, Info, FileText, Camera, Play } from 'lucide-react';
import { FlightLog } from './LogsUI';
import { Drawer } from './DrawerUI';

interface LogDetailDrawerProps {
  log: FlightLog | null;
  onClose: () => void;
}

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <Drawer 
      isOpen={!!log} 
      onClose={onClose} 
      title={`Flight #FS-0${log.id}`}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-[1.5rem] border">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar size={12} /> Date
            </div>
            <div className="font-bold">
              {new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-[1.5rem] border">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 flex items-center gap-1">
              <Timer size={12} /> Duration
            </div>
            <div className="font-bold">
              {Math.floor(parseInt(log.duration) / 60)}h {parseInt(log.duration) % 60}m
            </div>
          </div>
        </div>

        {/* Location & Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Landing Site</div>
              <div className="font-bold text-lg">{log.site}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              log.status === 'SIGNED OFF' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
            }`}>
              <Info size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Filing Status</div>
              <div className="font-bold text-lg">{log.status}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
            <FileText size={12} /> Pilot Observations
          </div>
          <div className="bg-muted/20 p-6 rounded-[2rem] border border-dashed">
            <p className="text-muted-foreground leading-relaxed italic">
              {log.notes || "No additional observations logged for this mission."}
            </p>
          </div>
        </div>

        {/* Media Gallery */}
        {log.attachments && log.attachments.length > 0 && (
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
              <Camera size={12} /> Visual Documentation
            </div>
            <div className="grid grid-cols-1 gap-4">
              {log.attachments.map((item, idx) => (
                <div key={idx} className="relative rounded-[2rem] overflow-hidden border shadow-lg group">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Log entry detail ${idx}`} 
                      className="w-full h-auto object-cover max-h-[300px]"
                    />
                  ) : (
                    <div className="relative group/video cursor-pointer">
                      <video 
                        src={item.url} 
                        className="w-full h-auto max-h-[300px] object-cover"
                        controls
                      />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase">
                    {item.type === 'image' ? 'Photograph' : 'Video Clip'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 flex flex-col gap-3">
          <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
            Edit Log Entry
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 border-2 border-border font-bold rounded-2xl hover:bg-muted transition-all active:scale-[0.98]"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Drawer>
  );
};
