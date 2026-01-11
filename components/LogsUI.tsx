
import React from 'react';
import { 
  Calendar, Timer, MapPin, PlaneTakeoff, 
  ArrowUpDown, SortAsc, SortDesc, Archive, Trash2, Eye
} from 'lucide-react';
import { LogMediaGallery } from './LogMediaUI';

export interface LogAttachment {
  url: string;
  type: 'image' | 'video';
}

export interface FlightLog {
  id: string;
  date: string;
  duration: string;
  site: string;
  notes: string;
  status: string;
  attachments?: LogAttachment[];
}

interface LogCardProps {
  log: FlightLog;
  onArchive?: (id: string) => void;
  onPreview?: (log: FlightLog) => void;
}

export const LogCard: React.FC<LogCardProps> = ({ log, onArchive, onPreview }) => {
  return (
    <div 
      className="bg-muted/20 p-5 border rounded-[1.5rem] group hover:bg-muted/40 transition-all cursor-pointer relative overflow-hidden"
      onClick={() => onPreview?.(log)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="bg-background rounded-2xl flex items-center justify-center border shadow-sm group-hover:bg-primary/10 transition-colors">
            <PlaneTakeoff size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <div className="font-bold">Flight #FS-0{log.id}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar size={10} /> 
                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="opacity-20">•</span>
              <span className="flex items-center gap-1">
                <Timer size={10} /> 
                {Math.floor(parseInt(log.duration) / 60)}h {parseInt(log.duration) % 60}m
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <div className="font-mono text-[10px] text-muted-foreground mb-1 flex items-center justify-end gap-1">
              <MapPin size={10} /> {log.site}
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
              log.status === 'SIGNED OFF' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {log.status}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(log);
              }}
              className="p-2 bg-background border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Quick Preview"
            >
              <Eye size={16} />
            </button>
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(log.id);
                }}
                className="p-2 bg-background border rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Archive Flight Log"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>          
        </div>
      </div>
      
      {log.notes && (
        <div className="pl-16 mt-2 border-t pt-3 border-border/10">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{log.notes}"
          </p>
        </div>
      )}

      {log.attachments && log.attachments.length > 0 && (
        <div className="pl-16 mt-4">
          <LogMediaGallery attachments={log.attachments} />
        </div>
      )}
    </div>
  );
};

export type SortField = 'date' | 'duration';
export type SortOrder = 'asc' | 'desc';

interface LogSortBarProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export const LogSortBar: React.FC<LogSortBarProps> = ({ sortField, sortOrder, onSortChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
        <button
          onClick={() => onSortChange('date', sortField === 'date' && sortOrder === 'desc' ? 'asc' : 'desc')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            sortField === 'date' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={14} /> 
          Date
          {sortField === 'date' && (sortOrder === 'desc' ? <SortDesc size={12} /> : <SortAsc size={12} />)}
        </button>
        <button
          onClick={() => onSortChange('duration', sortField === 'duration' && sortOrder === 'desc' ? 'asc' : 'desc')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            sortField === 'duration' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Timer size={14} /> 
          Duration
          {sortField === 'duration' && (sortOrder === 'desc' ? <SortDesc size={12} /> : <SortAsc size={12} />)}
        </button>
      </div>
    </div>
  );
};
