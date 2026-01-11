
import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Wind, Navigation, AlertTriangle, 
  CheckCircle, ListChecks, MessageSquareText,
  Clock, MapPin, Search, Plane, ChevronRight,
  PlaneTakeoff, X, Sun, Cloud
} from 'lucide-react';
import { getFlightBriefing } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'checklists' | 'logs'>('status');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [showWindAlert, setShowWindAlert] = useState(true);
  
  const [weatherData, setWeatherData] = useState({
    temp: '68°F',
    wind: '18 mph', // Changed to 18 to trigger the alert for demo purposes
    direction: 'NW',
    visibility: '10 mi',
    cloudBase: '4,000 ft'
  });

  // Placeholder forecast data
  const forecastData = [
    { day: 'Tomorrow', condition: 'Clear', temp: '72° / 54°', wind: '4-6 mph', icon: Sun },
    { day: 'Wednesday', condition: 'Partly Cloudy', temp: '69° / 52°', wind: '5-9 mph', icon: CloudSun },
    { day: 'Thursday', condition: 'Cloudy', temp: '64° / 48°', wind: '8-12 mph', icon: Cloud },
  ];

  const windSpeedValue = parseInt(weatherData.wind) || 0;
  const isHighWind = windSpeedValue > 15;

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const prompt = `Generate a concise flight briefing for a balloon pilot. Current weather: ${weatherData.temp}, Wind: ${weatherData.wind} from ${weatherData.direction}. Visibility: ${weatherData.visibility}. Focus on safety risks and launch feasibility.`;
      const result = await getFlightBriefing(prompt);
      setBriefing(result);
    } catch (err) {
      setBriefing("Error fetching AI briefing. Check connectivity.");
    } finally {
      setLoadingBriefing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, Pilot</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin size={14} /> Sonoma Field Base (N 38.2975, W 122.4579)
            <span className="text-green-500 font-bold">• Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'status' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Status
          </button>
          <button 
            onClick={() => setActiveTab('checklists')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'checklists' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Checklist
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Logs
          </button>
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* High Wind Alert Banner */}
          {isHighWind && showWindAlert && (
            <div className="bg-destructive/15 border-2 border-destructive/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="bg-destructive text-destructive-foreground p-2 rounded-full">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-destructive">High Wind Warning</h4>
                  <p className="text-sm text-destructive/80 font-medium">Surface winds are at {weatherData.wind}. Launch safety threshold exceeded (15 mph).</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWindAlert(false)}
                className="p-2 hover:bg-destructive/20 rounded-full text-destructive transition-colors"
                aria-label="Dismiss alert"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Weather Grid - Optimized for glanceability */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-colors ${isHighWind ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'}`}>
              <Wind className={`${isHighWind ? 'text-destructive' : 'text-primary'} mb-2`} size={32} />
              <div className={`text-2xl font-black ${isHighWind ? 'text-destructive' : ''}`}>{weatherData.wind}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Surface Wind</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-3xl border flex flex-col items-center justify-center text-center">
              <Navigation className="text-primary mb-2" size={32} />
              <div className="text-2xl font-black">{weatherData.direction}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Direction</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-3xl border flex flex-col items-center justify-center text-center">
              <CloudSun className="text-primary mb-2" size={32} />
              <div className="text-2xl font-black">{weatherData.temp}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ambient Temp</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-3xl border flex flex-col items-center justify-center text-center">
              <Search className="text-primary mb-2" size={32} />
              <div className="text-2xl font-black">{weatherData.visibility}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Visibility</div>
            </div>
          </div>

          {/* 3-Day Forecast Section */}
          <div className="bg-muted/30 border rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary" /> 3-Day Launch Outlook
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecastData.map((day, idx) => (
                <div key={idx} className="bg-background/50 border border-border/50 p-4 rounded-2xl flex items-center justify-between md:flex-col md:items-start md:gap-2">
                  <div className="flex items-center gap-3 md:w-full md:justify-between">
                    <span className="font-bold text-sm">{day.day}</span>
                    <day.icon size={20} className="text-primary" />
                  </div>
                  <div className="text-right md:text-left md:w-full">
                    <div className="text-sm font-semibold">{day.temp}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wind size={12} /> {day.wind}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Briefing Widget */}
            <div className="lg:col-span-2 bg-primary/5 border-primary/20 border-2 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-primary/5">
                <MessageSquareText size={120} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <SparkleIcon /> Smart Flight Briefing
                </h3>
                <button 
                  onClick={handleGenerateBriefing}
                  disabled={loadingBriefing}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary/90 disabled:opacity-50"
                >
                  {loadingBriefing ? 'Analyzing...' : 'Refresh AI Analysis'}
                </button>
              </div>
              
              <div className="bg-background/80 backdrop-blur p-4 rounded-2xl border border-primary/10 min-h-[120px]">
                {briefing ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Plane className="text-primary/30 mb-2 animate-bounce" />
                    <p className="text-muted-foreground text-sm italic">
                      Request a briefing to analyze today's weather and terrain risks using Gemini Intelligence.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> VFR Conditions</span>
                <span className={`flex items-center gap-1 ${isHighWind ? 'text-destructive font-bold' : 'text-orange-600'}`}>
                  <AlertTriangle size={14} /> {isHighWind ? 'DANGEROUS GUSTS' : 'Potential Gusts at 2k ft'}
                </span>
              </div>
            </div>

            {/* Next Flight Card */}
            <div className="bg-muted/30 border rounded-3xl p-6 flex flex-col">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} /> Next Mission</h3>
              <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Launch Time</span>
                  <span className="font-bold">06:15 AM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Passengers</span>
                  <span className="font-bold">4 Adults</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Balloon</span>
                  <span className="font-bold">SunChaser #04</span>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all">
                View Flight Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklists' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ListChecks /> Pre-Flight Checklist</h2>
            <span className="text-sm bg-muted px-2 py-1 rounded">3 / 8 Complete</span>
          </div>
          
          {[
            { id: 1, text: "Envelope Integrity Check", done: true },
            { id: 2, text: "Burner Test (Left & Right)", done: true },
            { id: 3, text: "Fuel Pressure Inspection", done: true },
            { id: 4, text: "Radio Communication Sync", done: false },
            { id: 5, text: "Landing Site Permission Verified", done: false },
            { id: 6, text: "Chase Vehicle Fuel Status", done: false },
            { id: 7, text: "Emergency Kit Inventory", done: false },
            { id: 8, text: "Pax Safety Briefing Signed", done: false },
          ].map(item => (
            <div 
              key={item.id} 
              className={`p-5 border rounded-2xl flex items-center gap-4 transition-all cursor-pointer ${item.done ? 'bg-muted/20 border-green-500/20' : 'hover:border-primary'}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30'}`}>
                {item.done && <CheckCircle size={16} />}
              </div>
              <span className={`font-medium ${item.done ? 'text-muted-foreground line-through' : ''}`}>
                {item.text}
              </span>
              <ChevronRight className="ml-auto text-muted-foreground" size={16} />
            </div>
          ))}
          
          <button className="w-full mt-6 py-4 bg-primary text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20">
            Submit Safe Launch Status
          </button>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Flight History</h2>
            <button className="text-sm text-primary font-bold">Export CSV</button>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/20 p-4 border rounded-2xl flex items-center justify-between group hover:bg-muted/40 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border shadow-sm group-hover:bg-primary/10">
                    <PlaneTakeoff size={20} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">Flight #FS-0{842 - i}</div>
                    <div className="text-xs text-muted-foreground">May {24 - i}, 2024 • 1h 45m duration</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-muted-foreground mb-1">Land Site Delta</div>
                  <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">SIGNED OFF</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SparkleIcon = () => (
  <span className="text-primary animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  </span>
);

export default Dashboard;
