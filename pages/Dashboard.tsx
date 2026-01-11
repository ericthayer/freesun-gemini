
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudSun, Wind, Navigation, AlertTriangle, 
  CheckCircle, ListChecks, MessageSquareText,
  Clock, MapPin, Search, Plane, ChevronRight,
  PlaneTakeoff, X, Sun, Cloud, Users, Timer, Plus, Calendar, FileText,
  Mail, Phone, Award, Filter
} from 'lucide-react';
import { getFlightBriefing } from '../services/geminiService';
import { CrewMember, CrewMemberCard, CrewFilterBar } from '../components/CrewUI';

type TabType = 'status' | 'checklists' | 'logs' | 'crew';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [showWindAlert, setShowWindAlert] = useState(true);
  
  // Pilot context for AI briefing
  const [pilotContext, setPilotContext] = useState({
    passengers: '4',
    balloon: 'SunChaser #04 (Medium)',
    duration: '90'
  });

  const [weatherData, setWeatherData] = useState({
    temp: '68°F',
    wind: '18 mph',
    direction: 'NW',
    visibility: '10 mi',
    cloudBase: '4,000 ft'
  });

  // Checklist state
  const [checklists, setChecklists] = useState([
    { id: 1, text: "Envelope Integrity Check", done: true },
    { id: 2, text: "Burner Test (Left & Right)", done: true },
    { id: 3, text: "Fuel Pressure Inspection", done: true },
    { id: 4, text: "Radio Communication Sync", done: false },
    { id: 5, text: "Landing Site Permission Verified", done: false },
    { id: 6, text: "Chase Vehicle Fuel Status", done: false },
    { id: 7, text: "Emergency Kit Inventory", done: false },
    { id: 8, text: "Pax Safety Briefing Signed", done: false },
  ]);

  // Logs state
  const [logs, setLogs] = useState([
    { id: '841', date: '2024-05-24', duration: '105', site: 'Land Site Delta', notes: 'Smooth landing, light crosswinds on approach.', status: 'SIGNED OFF' },
    { id: '840', date: '2024-05-23', duration: '80', site: 'Valley Creek', notes: 'Excellent visibility. Passengers enjoyed the vineyard tour.', status: 'SIGNED OFF' },
    { id: '839', date: '2024-05-22', duration: '125', site: 'Hilltop Basin', notes: 'Challenging thermals near the ridge. Extra fuel used.', status: 'SIGNED OFF' },
    { id: '838', date: '2024-05-21', duration: '70', site: 'Riverside', notes: 'Quiet flight, early morning mist cleared by 07:00.', status: 'SIGNED OFF' },
  ]);

  // Crew state
  const [crewSearch, setCrewSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minExpFilter, setMinExpFilter] = useState(0);
  const [certTypeFilter, setCertTypeFilter] = useState('All');

  const [crewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'Sarah "Sky" Miller',
      role: 'Pilot',
      experience: 12,
      contact: { email: 'sarah@freesun.net', phone: '+1 555-0101' },
      certifications: ['Commercial LTA License', 'Flight Instructor', 'Night Rating'],
      bio: 'Lifelong aviation enthusiast with over 1,500 flight hours across three continents. Specialist in high-altitude mountain flights.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Ground Crew',
      experience: 5,
      contact: { email: 'mike@freesun.net', phone: '+1 555-0102' },
      certifications: ['Crew Chief Certified', 'Emergency Response', 'Heavy Vehicle Op'],
      bio: 'Precision-focused ground lead. Mikes team has the fastest inflation and recovery records in the club.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '3',
      name: 'David Thorne',
      role: 'Pilot',
      experience: 20,
      contact: { email: 'thorne@freesun.net', phone: '+1 555-0103' },
      certifications: ['Master Pilot LTA', 'Maintenance Technician', 'Safety Officer'],
      bio: 'The "Grandmaster" of FreeSun. David has been flying since the club inception and leads our safety committee.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '4',
      name: 'Elena Rodriguez',
      role: 'Ground Crew',
      experience: 3,
      contact: { email: 'elena@freesun.net', phone: '+1 555-0104' },
      certifications: ['Recovery Specialist', 'Radio Communications'],
      bio: 'Expert navigator and recovery lead. Never lost a balloon, even in the dense morning fog of the valley.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  ]);

  const filteredCrew = useMemo(() => {
    // Fuzzy search: split by spaces and check if all terms match some field
    const searchTerms = crewSearch.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    return crewMembers.filter(member => {
      // Fuzzy match logic
      const searchableStr = `${member.name} ${member.role} ${member.bio} ${member.certifications.join(' ')}`.toLowerCase();
      const matchesSearch = searchTerms.every(term => searchableStr.includes(term));
      
      const matchesRole = roleFilter === 'All' || member.role === roleFilter;
      const matchesExp = member.experience >= minExpFilter;
      const matchesCert = certTypeFilter === 'All' || member.certifications.some(c => 
        c.toLowerCase().includes(certTypeFilter.toLowerCase())
      );

      return matchesSearch && matchesRole && matchesExp && matchesCert;
    });
  }, [crewMembers, crewSearch, roleFilter, minExpFilter, certTypeFilter]);

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '60',
    notes: '',
    site: 'Manual Entry'
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (parseInt(logs[0]?.id || '0') + 1).toString();
    setLogs([{ ...newLog, id, status: 'PENDING REVIEW' }, ...logs]);
    setIsAddingLog(false);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      duration: '60',
      notes: '',
      site: 'Manual Entry'
    });
  };

  const toggleChecklist = (id: number) => {
    setChecklists(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const completedCount = checklists.filter(item => item.done).length;

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
      const prompt = `Generate a concise flight briefing for a balloon pilot.
Current Weather: Temp: ${weatherData.temp}, Wind: ${weatherData.wind} from ${weatherData.direction}. Visibility: ${weatherData.visibility}.
Flight Configuration:
- Balloon: ${pilotContext.balloon}
- Passenger Count: ${pilotContext.passengers}
- Intended Duration: ${pilotContext.duration} minutes
Focus on safety risks, fuel management, and launch feasibility specific to this configuration and current conditions.`;
      
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
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl overflow-x-auto no-scrollbar">
          {(['status', 'checklists', 'logs', 'crew'] as TabType[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-6">
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
              <button onClick={() => setShowWindAlert(false)} className="p-2 hover:bg-destructive/20 rounded-full text-destructive transition-colors" aria-label="Dismiss alert">
                <X size={18} />
              </button>
            </div>
          )}

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
            <div className="lg:col-span-2 bg-primary/5 border-primary/20 border-2 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-primary/5">
                <MessageSquareText size={120} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><SparkleIcon /> Smart Flight Briefing</h3>
                <button onClick={handleGenerateBriefing} disabled={loadingBriefing} className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {loadingBriefing ? 'Analyzing...' : 'Generate New Briefing'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Plane size={10} /> Balloon Type</label>
                  <select value={pilotContext.balloon} onChange={(e) => setPilotContext({...pilotContext, balloon: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>SunChaser #04 (Medium)</option>
                    <option>DawnRider #01 (Small)</option>
                    <option>Atlas #09 (Large)</option>
                    <option>SkyGazer #02 (XL)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Users size={10} /> Passengers</label>
                  <select value={pilotContext.passengers} onChange={(e) => setPilotContext({...pilotContext, passengers: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>1 (Private)</option>
                    <option>2 (Couple)</option>
                    <option>4 (Standard)</option>
                    <option>6 (Group)</option>
                    <option>8+ (Large Group)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Timer size={10} /> Duration (Min)</label>
                  <select value={pilotContext.duration} onChange={(e) => setPilotContext({...pilotContext, duration: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="90">90 Minutes</option>
                    <option value="120">120 Minutes</option>
                  </select>
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur p-5 rounded-2xl border border-primary/10 min-h-[160px] shadow-inner">
                {briefing ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Plane className="text-primary/30 mb-2 animate-bounce" />
                    <p className="text-muted-foreground text-sm italic max-w-xs">Set your flight configuration above and request a briefing for specialized safety analysis.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-muted/30 border rounded-3xl p-6 flex flex-col">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} /> Next Mission</h3>
              <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Launch Time</span>
                  <span className="font-bold">06:15 AM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Passengers</span>
                  <span className="font-bold">{pilotContext.passengers} Adult(s)</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-sm text-muted-foreground">Balloon</span>
                  <span className="font-bold truncate max-w-[120px]" title={pilotContext.balloon}>{pilotContext.balloon}</span>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all active:scale-[0.98]">View Flight Plan</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklists' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ListChecks /> Pre-Flight Checklist</h2>
            <span className="text-sm bg-muted px-2 py-1 rounded font-bold transition-all">
              {completedCount} / {checklists.length} Complete
            </span>
          </div>
          <div className="space-y-3">
            {checklists.map(item => (
              <div key={item.id} onClick={() => toggleChecklist(item.id)} className={`p-5 border rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${item.done ? 'bg-green-500/5 border-green-500/30' : 'bg-background hover:border-primary border-border'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform ${item.done ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-muted-foreground/30 scale-100'}`}>
                  {item.done && <div className="animate-in zoom-in-50 duration-200"><CheckCircle size={16} /></div>}
                </div>
                <span className={`font-medium transition-all duration-300 ${item.done ? 'text-muted-foreground line-through opacity-70' : ''}`}>{item.text}</span>
                <ChevronRight className={`ml-auto text-muted-foreground transition-transform duration-300 ${item.done ? 'rotate-90 opacity-0' : ''}`} size={16} />
              </div>
            ))}
          </div>
          <button disabled={completedCount < checklists.length} className={`w-full mt-6 py-4 font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 ${completedCount === checklists.length ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'}`}>
            {completedCount === checklists.length ? 'Submit Safe Launch Status' : `Complete ${checklists.length - completedCount} more items`}
          </button>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Flight History</h2>
            <div className="flex gap-4">
              <button onClick={() => setIsAddingLog(!isAddingLog)} className="text-sm text-primary font-bold flex items-center gap-1 hover:underline">
                {isAddingLog ? <X size={16} /> : <Plus size={16} />} {isAddingLog ? 'Cancel' : 'New Entry'}
              </button>
              <button className="text-sm text-muted-foreground font-bold hover:text-primary transition-colors">Export CSV</button>
            </div>
          </div>
          {isAddingLog && (
            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-[2rem] p-6 animate-in zoom-in-95 duration-200">
              <form onSubmit={handleAddLog} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Calendar size={12} /> Flight Date</label>
                    <input type="date" required value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Timer size={12} /> Duration (Minutes)</label>
                    <input type="number" required min="1" value={newLog.duration} onChange={(e) => setNewLog({...newLog, duration: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><FileText size={12} /> Flight Notes & Observations</label>
                  <textarea placeholder="Enter weather conditions, landing details, or maintenance observations..." value={newLog.notes} onChange={(e) => setNewLog({...newLog, notes: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddingLog(false)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all">Discard</button>
                  <button type="submit" className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Save Log Entry</button>
                </div>
              </form>
            </div>
          )}
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="bg-muted/20 p-5 border rounded-[1.5rem] group hover:bg-muted/40 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border shadow-sm group-hover:bg-primary/10 transition-colors">
                      <PlaneTakeoff size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold">Flight #FS-0{log.id}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="opacity-20">•</span>
                        <span className="flex items-center gap-1"><Timer size={10} /> {Math.floor(parseInt(log.duration) / 60)}h {parseInt(log.duration) % 60}m</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-muted-foreground mb-1 flex items-center justify-end gap-1"><MapPin size={10} /> {log.site}</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${log.status === 'SIGNED OFF' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{log.status}</div>
                  </div>
                </div>
                {log.notes && <div className="pl-16 mt-2 border-t pt-3 border-border/10"><p className="text-xs text-muted-foreground italic leading-relaxed">"{log.notes}"</p></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'crew' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mt-2"><Users className="text-primary" /> Crew Directory</h2>
            <div className="w-full md:max-w-xl">
              <CrewFilterBar 
                search={crewSearch}
                onSearchChange={setCrewSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                expFilter={minExpFilter}
                onExpFilterChange={setMinExpFilter}
                certFilter={certTypeFilter}
                onCertFilterChange={setCertTypeFilter}
              />
            </div>
          </div>

          {filteredCrew.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {filteredCrew.map(member => (
                <CrewMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-muted-foreground">No crew members match your filters</h3>
              <p className="text-sm text-muted-foreground/60">Try adjusting your search terms or filter criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SparkleIcon = () => (
  <span className="text-primary animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  </span>
);

export default Dashboard;
