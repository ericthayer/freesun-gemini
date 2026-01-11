
import React from 'react';
import { AlertOctagon, Zap, Wind, X, Clock } from 'lucide-react';
import { WeatherAlert } from '../services/weatherService';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
  onDismiss: (id: string) => void;
}

export const WeatherAlertsList: React.FC<WeatherAlertsProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`relative overflow-hidden rounded-2xl border-2 p-4 flex items-start gap-4 transition-all ${
            alert.severity === 'high' 
              ? 'bg-destructive/10 border-destructive/30 text-destructive' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500'
          }`}
        >
          {/* Animated background pulse for high severity */}
          {alert.severity === 'high' && (
            <div className="absolute inset-0 bg-destructive/5 animate-pulse pointer-events-none" />
          )}

          <div className={`p-2 rounded-full shrink-0 ${
            alert.severity === 'high' ? 'bg-destructive text-destructive-foreground' : 'bg-amber-500 text-white'
          }`}>
            {alert.type === 'STORM_CELL' && <Zap size={18} />}
            {alert.type === 'WIND_SHIFT' && <Wind size={18} />}
            {alert.type === 'RAPID_INCREASE' && <AlertOctagon size={18} />}
          </div>

          <div className="flex-grow pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest opacity-70">
                {alert.severity === 'high' ? 'Immediate Alert' : 'Advisory'}
              </span>
              <span className="text-[10px] opacity-50 flex items-center gap-1 font-bold">
                <Clock size={10} /> 
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-sm font-bold leading-tight">{alert.message}</p>
          </div>

          <button 
            onClick={() => onDismiss(alert.id)}
            className="absolute top-3 right-3 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
