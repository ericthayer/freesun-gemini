
import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface WeatherCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  isWarning?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ icon: Icon, value, label, isWarning }) => (
  <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-colors ${isWarning ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'}`}>
    <Icon className={`${isWarning ? 'text-destructive' : 'text-primary'} mb-2`} size={32} />
    <div className={`text-2xl font-black ${isWarning ? 'text-destructive' : ''}`}>{value}</div>
    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
  </div>
);

interface ForecastCardProps {
  day: string;
  temp: string;
  wind: string;
  icon: LucideIcon;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ day, temp, wind, icon: Icon }) => (
  <div className="bg-background/50 border border-border/50 p-4 rounded-2xl flex items-center justify-between md:flex-col md:items-start md:gap-2">
    <div className="flex items-center gap-3 md:w-full md:justify-between">
      <span className="font-bold text-sm">{day}</span>
      <Icon size={20} className="text-primary" />
    </div>
    <div className="text-right md:text-left md:w-full">
      <div className="text-sm font-semibold">{temp}</div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon size={12} className="opacity-50" /> {wind}
      </div>
    </div>
  </div>
);

export const SparkleIcon = () => (
  <span className="text-primary animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  </span>
);

export const Spinner = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);
