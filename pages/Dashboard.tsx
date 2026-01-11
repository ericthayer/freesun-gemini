
import React, { useState, useEffect, useMemo } from 'react';
import {
  CloudSun, Wind, Navigation, AlertTriangle,
  CheckCircle, ListChecks, MessageSquareText,
  Clock, MapPin, Search, Plane, ChevronRight,
  PlaneTakeoff, X, Sun, Cloud, Users, Timer, Plus, Calendar, FileText,
  Mail, Phone, Award, Filter, Briefcase, GraduationCap,
  User
} from 'lucide-react';
import { getFlightBriefing } from '../services/geminiService';
import { CrewMember, CrewMemberCard, CrewFilterBar } from '../components/CrewUI';
import { WeatherCard, ForecastCard, SparkleIcon, Spinner } from '../components/StatusUI';
import { LogCard, LogSortBar, FlightLog, SortField, SortOrder } from '../components/LogsUI';
import { ConfirmationModal } from '../components/CommonUI';

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
  const [logs, setLogs] = useState<FlightLog[]>([
    { id: '841', date: '2024-05-24', duration: '105', site: 'Land Site Delta', notes: 'Smooth landing, light crosswinds on approach.', status: 'SIGNED OFF' },
    { id: '840', date: '2024-05-23', duration: '80', site: 'Valley Creek', notes: 'Excellent visibility. Passengers enjoyed the vineyard tour.', status: 'SIGNED OFF' },
    { id: '839', date: '2024-05-22', duration: '125', site: 'Hilltop Basin', notes: 'Challenging thermals near the ridge. Extra fuel used.', status: 'SIGNED OFF' },
    { id: '838', date: '2024-05-21', duration: '70', site: 'Riverside', notes: 'Quiet flight, early morning mist cleared by 07:00.', status: 'SIGNED OFF' },
  ]);

  const [logSortField, setLogSortField] = useState<SortField>('date');
  const [logSortOrder, setLogSortOrder] = useState<SortOrder>('desc');
  const [logToArchive, setLogToArchive] = useState<string | null>(null);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      let comparison = 0;
      if (logSortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (logSortField === 'duration') {
        comparison = parseInt(a.duration) - parseInt(b.duration);
      }
      return logSortOrder === 'desc' ? -comparison : comparison;
    });
  }, [logs, logSortField, logSortOrder]);

  // Crew state
  const [crewSearch, setCrewSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minExpFilter, setMinExpFilter] = useState(0);
  const [certTypeFilter, setCertTypeFilter] = useState('All');
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'Sarah "Sky" Miller',
      role: 'Pilot',
      experience: 12,
      contact: { email: 'sarah@freesun.net', phone: '+1 555-0101' },
      certifications: ['Commercial LTA License', 'Flight Instructor', 'Night Rating'],
      bio: 'Lifelong aviation enthusiast with over 1,500 flight hours across three continents. Specialist in high-altitude mountain flights.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      availability: 'available'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Ground Crew',
      experience: 5,
      contact: { email: 'mike@freesun.net', phone: '+1 555-0102' },
      certifications: ['Crew Chief Certified', 'Emergency Response', 'Heavy Vehicle Op'],
      bio: 'Precision-focused ground lead. Mikes team has the fastest inflation and recovery records in the club.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      availability: 'busy'
    },
    {
      id: '3',
      name: 'David Thorne',
      role: 'Pilot',
      experience: 20,
      contact: { email: 'thorne@freesun.net', phone: '+1 555-0103' },
      certifications: ['Master Pilot LTA', 'Maintenance Technician', 'Safety Officer'],
      bio: 'The "Grandmaster" of FreeSun. David has been flying since the club inception and leads our safety committee.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      availability: 'available'
    },
    {
      id: '4',
      name: 'Elena Rodriguez',
      role: 'Ground Crew',
      experience: 3,
      contact: { email: 'elena@freesun.net', phone: '+1 555-0104' },
      certifications: ['Recovery Specialist', 'Radio Communications'],
      bio: 'Expert navigator and recovery lead. Never lost a balloon, even in the dense morning fog of the valley.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      availability: 'available'
    }
  ]);

  const filteredCrew = useMemo(() => {
    const searchTerms = crewSearch.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    return crewMembers.filter(member => {
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

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setCrewMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const handleToggleAvailability = (id: string) => {
    setCrewMembers(prev => prev.map(m => 
      m.id === id 
        ? { ...m, availability: m.availability === 'available' ? 'busy' : 'available' } 
        : m
    ));
  };

  const handleConfirmArchive = () => {
    if (logToArchive) {
      setLogs(prev => prev.filter(log => log.id !== logToArchive));
      setLogToArchive(null);
    }
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
    <div className="container mx-auto px-4 py-8 max-w-5xl grid grid-rows-[auto_1fr] grow">
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
        <div className="space-y-6 flex flex-col">
          {isHighWind && showWindAlert && (
            <div className="bg-destructive/15 border-2 border-destructive/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="bg-destructive text-destructive-foreground p-2 rounded-full"><AlertTriangle size={20} /></div>
                <div>
                  <h4 className="font-bold text-destructive">High Wind Warning</h4>
                  <p className="text-sm text-destructive/80 font-medium">Surface winds are at {weatherData.wind}. Launch safety threshold exceeded (15 mph).</p>
                </div>
              </div>
              <button onClick={() => setShowWindAlert(false)} className="p-2 hover:bg-destructive/20 rounded-full text-destructive transition-colors"><X size={18} /></button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WeatherCard icon={Wind} value={weatherData.wind} label="Surface Wind" isWarning={isHighWind} />
            <WeatherCard icon={Navigation} value={weatherData.direction} label="Direction" />
            <WeatherCard icon={CloudSun} value={weatherData.temp} label="Ambient Temp" />
            <WeatherCard icon={Search} value={weatherData.visibility} label="Visibility" />
          </div>

          <div className="bg-muted/30 border rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-primary" /> 3-Day Launch Outlook</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecastData.map((day, idx) => (
                <ForecastCard key={idx} {...day} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 grow">
            <div className="lg:col-span-2 bg-primary/5 border-primary/20 border-2 rounded-3xl p-6 relative overflow-hidden grid grid-rows-[auto_auto_1fr]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><SparkleIcon /> Smart Flight Briefing</h3>
                <button 
                  onClick={handleGenerateBriefing} 
                  disabled={loadingBriefing} 
                  className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {loadingBriefing && <Spinner size={14} />}
                  {loadingBriefing ? 'Analyzing...' : 'Generate New Briefing'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Plane size={10} /> Balloon Type</label>
                  <select value={pilotContext.balloon} onChange={(e) => setPilotContext({...pilotContext, balloon: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>SunChaser #04 (Medium)</option><option>DawnRider #01 (Small)</option><option>Atlas #09 (Large)</option><option>SkyGazer #02 (XL)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Users size={10} /> Passengers</label>
                  <select value={pilotContext.passengers} onChange={(e) => setPilotContext({...pilotContext, passengers: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>1 (Private)</option><option>2 (Couple)</option><option>4 (Standard)</option><option>6 (Group)</option><option>8+ (Large Group)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1 flex items-center gap-1"><Timer size={10} /> Duration (Min)</label>
                  <select value={pilotContext.duration} onChange={(e) => setPilotContext({...pilotContext, duration: e.target.value})} className="bg-background/50 border border-primary/10 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option value="45">45 Minutes</option><option value="60">60 Minutes</option><option value="90">90 Minutes</option><option value="120">120 Minutes</option>
                  </select>
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur p-5 rounded-2xl border border-primary/30 min-h-[160px] shadow-inner grid place-content-center">
                {briefing ? <div className="animate-in fade-in slide-in-from-bottom-2"><p className="text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p></div> : <div className="flex flex-col items-center justify-center text-center py-1"><Plane className="text-primary/30 mb-2 animate-bounce" /><p className="text-muted-foreground text-sm italic max-w-xs">Set your flight configuration above and request a briefing for specialized safety analysis.</p></div>}
              </div>
            </div>
            <div className="bg-muted/30 border rounded-3xl p-6 flex flex-col">
              <div className="sticky top-[6rem]">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} /> Next Mission</h3>
                <div className="space-y-4 flex-grow">
                  <div className="flex justify-between items-center border-b pb-4"><span className="text-sm text-muted-foreground">Launch Time</span><span className="font-bold">06:15 AM</span></div>
                  <div className="flex justify-between items-center border-b pb-4"><span className="text-sm text-muted-foreground">Passengers</span><span className="font-bold">{pilotContext.passengers} Adult(s)</span></div>
                  <div className="flex justify-between items-center border-b pb-4"><span className="text-sm text-muted-foreground">Balloon</span><span className="font-bold truncate max-w-[120px]" title={pilotContext.balloon}>{pilotContext.balloon}</span></div>
                </div>
                <button className="mt-6 w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all active:scale-[0.98]">View Flight Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklists' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-bold flex items-center gap-2"><ListChecks /> Pre-Flight Checklist</h2><span className="text-sm bg-muted px-2 py-1 rounded font-bold transition-all">{completedCount} / {checklists.length} Complete</span></div>
          <div className="space-y-3">
            {checklists.map(item => (
              <div key={item.id} onClick={() => toggleChecklist(item.id)} className={`p-5 border rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${item.done ? 'bg-green-500/5 border-green-500/30' : 'bg-background hover:border-primary border-border'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform ${item.done ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-muted-foreground/30 scale-100'}`}>{item.done && <div className="animate-in zoom-in-50 duration-200"><CheckCircle size={16} /></div>}</div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Flight History</h2>
            <div className="flex flex-wrap items-center gap-4">
              <LogSortBar 
                sortField={logSortField}
                sortOrder={logSortOrder}
                onSortChange={(field, order) => {
                  setLogSortField(field);
                  setLogSortOrder(order);
                }}
              />
              <div className="flex gap-4">
                <button onClick={() => setIsAddingLog(!isAddingLog)} className="text-sm text-primary font-bold flex items-center gap-1 hover:underline">{isAddingLog ? <X size={16} /> : <Plus size={16} />} {isAddingLog ? 'Cancel' : 'New Entry'}</button>
                <button className="text-sm text-muted-foreground font-bold hover:text-primary transition-colors">Export CSV</button>
              </div>
            </div>
          </div>
          {isAddingLog && (
            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-[2rem] p-6 animate-in zoom-in-95 duration-200">
              <form onSubmit={handleAddLog} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Calendar size={12} /> Flight Date</label><input type="date" required value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Timer size={12} /> Duration (Minutes)</label><input type="number" required min="1" value={newLog.duration} onChange={(e) => setNewLog({...newLog, duration: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><FileText size={12} /> Flight Notes & Observations</label><textarea placeholder="Enter weather conditions, landing details, or maintenance observations..." value={newLog.notes} onChange={(e) => setNewLog({...newLog, notes: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none" /></div>
                <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsAddingLog(false)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all">Discard</button><button type="submit" className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Save Log Entry</button></div>
              </form>
            </div>
          )}
          <div className="space-y-4">
            {sortedLogs.map(log => (
              <LogCard 
                key={log.id} 
                log={log} 
                onArchive={(id) => setLogToArchive(id)}
              />
            ))}
            {sortedLogs.length === 0 && (
              <div className="py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
                <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">No flight logs found</h3>
                <p className="text-sm text-muted-foreground/60">Start a new flight or adjust your filters</p>
              </div>
            )}
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

          {editingMember && (
            <div className="bg-muted/30 border-2 border-primary/30 rounded-[2rem] p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><Edit2Icon /> Edit Profile: {editingMember.name}</h3>
                <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-muted rounded-full"><X size={18} /></button>
              </div>
              <form onSubmit={handleEditSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><User size={12} /> Full Name</label>
                    <input type="text" required value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Users size={12} /> Role</label>
                    <select value={editingMember.role} onChange={(e) => setEditingMember({...editingMember, role: e.target.value as any})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                      <option value="Pilot">Pilot</option><option value="Ground Crew">Ground Crew</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Mail size={12} /> Email</label>
                    <input type="email" required value={editingMember.contact.email} onChange={(e) => setEditingMember({...editingMember, contact: {...editingMember.contact, email: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Phone size={12} /> Phone</label>
                    <input type="tel" required value={editingMember.contact.phone} onChange={(e) => setEditingMember({...editingMember, contact: {...editingMember.contact, phone: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Briefcase size={12} /> Years Experience</label>
                    <input type="number" required min="0" value={editingMember.experience} onChange={(e) => setEditingMember({...editingMember, experience: parseInt(e.target.value) || 0})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><FileText size={12} /> Bio</label>
                  <textarea value={editingMember.bio} onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px] resize-none" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingMember(null)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Update Profile</button>
                </div>
              </form>
            </div>
          )}

          {filteredCrew.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {filteredCrew.map(member => (
                <CrewMemberCard 
                  key={member.id} 
                  member={member} 
                  onEdit={setEditingMember} 
                  onToggleAvailability={handleToggleAvailability}
                />
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

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={logToArchive !== null}
        onClose={() => setLogToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Flight Log"
        message="Are you sure you want to archive this flight log? It will be removed from your active history list. This action can be reversed by a club administrator."
        confirmText="Archive Entry"
        variant="danger"
      />
    </div>
  );
};

const Edit2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);

export default Dashboard;
