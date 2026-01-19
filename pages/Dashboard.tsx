
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CloudSun, Wind, Navigation, AlertTriangle,
  ListChecks,
  Clock, MapPin, Search, ChevronRight,
  X, Sun, Cloud, Users, Timer, Plus, Calendar, FileText,
  RefreshCw, Plane, HelpCircle, Activity, Sparkles, ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { getFlightBriefing } from '../services/geminiService';
import { CrewMember, CrewMemberCard, CrewFilterBar } from '../components/CrewUI';
import { WeatherCard, ForecastCard } from '../components/StatusUI';
import { LogCard, LogSortBar, FlightLog, SortField, SortOrder, LogAttachment } from '../components/LogsUI';
import { ConfirmationModal } from '../components/CommonUI';
import { BriefingCard } from '../components/BriefingUI';
import { calculateCrewRelevance } from '../utils/searchUtils';
import { fetchLiveWeather, detectWeatherAlerts, WeatherSnapshot, WeatherAlert } from '../services/weatherService';
import { WeatherAlertsList } from '../components/WeatherAlertsUI';
import { CrewProfileForm } from '../components/CrewProfileForm';
import { LogMediaUpload } from '../components/LogMediaUI';
import { LogDetailDrawer } from '../components/LogDetailDrawer';
import { Drawer } from '../components/DrawerUI';
import { ContextualTutorial, TutorialStep } from '../components/ContextualTutorial';
import { MaintenanceHub, MaintenanceEntry } from '../components/MaintenanceUI';

type TabType = 'status' | 'checklists' | 'logs' | 'crew';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [showWindAlert, setShowWindAlert] = useState(true);
  const [briefingConstraints, setBriefingConstraints] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isManifestGenerated, setIsManifestGenerated] = useState(false);
  const [isGeneratingManifest, setIsGeneratingManifest] = useState(false);

  // Maintenance State
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceEntry[]>([
    {
      id: 'm1',
      balloonName: 'SunChaser #04 (Medium)',
      date: '2024-05-15',
      serviceType: '100-Hour Inspection',
      partsUsed: 'Burner hoses, load ring gaskets',
      notes: 'Structural integrity verified. Fuel pressure optimal at all ports.',
      technician: 'Sarah Miller'
    }
  ]);

  const balloonsList = ['SunChaser #04 (Medium)', 'DawnRider #01 (Small)', 'Atlas #09 (Large)', 'SkyGazer #02 (XL)'];

  const handleAddMaintenance = (log: MaintenanceEntry) => setMaintenanceLogs([log, ...maintenanceLogs]);
  const handleUpdateMaintenance = (updated: MaintenanceEntry) => setMaintenanceLogs(maintenanceLogs.map(l => l.id === updated.id ? updated : l));
  const handleDeleteMaintenance = (id: string) => setMaintenanceLogs(maintenanceLogs.filter(l => l.id !== id));

  // Pilot Tutorial Steps
  const pilotTutorialSteps: TutorialStep[] = [
    {
      targetId: "weather-section",
      title: "Weather Intelligence",
      description: "Real-time surface winds and visibility are monitored every 30 seconds. High-wind warnings will pulse if safety limits are exceeded.",
      icon: <Wind size={32} />
    },
    {
      targetId: "briefing-section",
      title: "AI Flight Assistant",
      description: "Powered by Gemini, this tool generates complex flight risk assessments based on your current weather and specific balloon configuration.",
      icon: <Sparkles size={32} />
    },
    {
      targetId: "navigation-tabs",
      title: "Mission Logistics",
      description: "Quickly toggle between active pre-flight checklists, historical logs, and the global crew directory.",
      icon: <ListChecks size={32} />
    },
    {
      targetId: "mission-section",
      title: "Export Control",
      description: "Finalize and export your mission manifest. This document is formatted for official safety handovers and chase vehicle coordination.",
      icon: <FileText size={32} />
    }
  ];

  // Global Event Listener for re-triggering tutorial from Settings
  useEffect(() => {
    const handleStartTutorial = () => setShowTutorial(true);
    window.addEventListener('freesun-start-tutorial', handleStartTutorial);
    return () => window.removeEventListener('freesun-start-tutorial', handleStartTutorial);
  }, []);

  // Check for first-time user
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('freesun_pilot_contextual_tutorial_complete');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('freesun_pilot_contextual_tutorial_complete', 'true');
    setShowTutorial(false);
  };

  // Pilot context for AI briefing
  const [pilotContext, setPilotContext] = useState({
    passengers: '4',
    balloon: 'SunChaser #04 (Medium)',
    duration: '90'
  });

  // Weather System State
  const [weatherData, setWeatherData] = useState({
    temp: '68°F',
    wind: '18 mph',
    direction: 'NW',
    visibility: '10 mi',
    cloudBase: '4,000 ft'
  });
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const lastSnapshot = useRef<WeatherSnapshot | null>(null);

  // Poll for weather data
  useEffect(() => {
    const updateWeather = async () => {
      if (isSimulationMode) {
        setWeatherData(prev => ({
          ...prev,
          wind: '22 mph',
          direction: 'N (GUSTING)'
        }));

        const simAlert: WeatherAlert = {
          id: 'sim-wind',
          type: 'RAPID_INCREASE',
          severity: 'high',
          message: 'SIMULATED: Extreme surface winds detected. Abort launch window.',
          timestamp: Date.now()
        };

        setWeatherAlerts(prev => {
          if (prev.some(a => a.id === 'sim-wind')) return prev;
          return [simAlert, ...prev];
        });
        return;
      }

      setIsWeatherLoading(true);
      try {
        const coords = { lat: 38.2975, lon: -122.4579 };
        const weatherApiKey = (process.env as any).WEATHER_API_KEY || 'FREE_SUN_MOCK_KEY';
        const snapshot = await fetchLiveWeather(coords.lat, coords.lon, weatherApiKey);

        setWeatherData(prev => ({
          ...prev,
          temp: snapshot.temp,
          wind: `${snapshot.windSpeed} mph`,
          direction: snapshot.windDirection
        }));

        const newAlerts = detectWeatherAlerts(snapshot, lastSnapshot.current);
        if (newAlerts.length > 0) {
          setWeatherAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
        }

        lastSnapshot.current = snapshot;
      } catch (err) {
        console.error("Failed to fetch live weather", err);
      } finally {
        setIsWeatherLoading(false);
      }
    };

    updateWeather();
    const intervalId = window.setInterval(updateWeather, 30000);
    return () => clearInterval(intervalId);
  }, [isSimulationMode]);

  const dismissAlert = (id: string) => {
    setWeatherAlerts(prev => prev.filter(a => a.id !== id));
  };

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

      const result = await getFlightBriefing(prompt, briefingConstraints);
      setBriefing(result);
    } catch (err) {
      setBriefing("Error fetching AI briefing. Check connectivity.");
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleGenerateManifest = () => {
    setIsGeneratingManifest(true);
    setTimeout(() => {
      setIsGeneratingManifest(false);
      setIsManifestGenerated(true);
    }, 1500);
  };

  // Shared Mission Data for Exports
  const missionData = useMemo(() => ({
    id: 'FS-' + Math.floor(1000 + Math.random() * 9000),
    launchTime: "06:15 AM",
    passengers: `${pilotContext.passengers} Adult(s)`,
    balloon: pilotContext.balloon,
    location: "Sonoma Field Base (N 38.2975, W 122.4579)",
    pilot: "Sarah \"Sky\" Miller",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    briefingSummary: briefing
  }), [pilotContext, briefing]);

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
    {
      id: '841',
      date: '2024-05-24',
      duration: '105',
      site: 'Land Site Delta',
      notes: 'Smooth landing, light crosswinds on approach.',
      status: 'SIGNED OFF',
      attachments: [
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200', type: 'image' },
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200', type: 'image' }
      ]
    },
    {
      id: '840',
      date: '2024-05-23',
      duration: '80',
      site: 'Valley Creek',
      notes: 'Excellent visibility. Passengers enjoyed the vineyard tour.',
      status: 'SIGNED OFF'
    }
  ]);

  const [logSortField, setLogSortField] = useState<SortField>('date');
  const [logSortOrder, setLogSortOrder] = useState<SortOrder>('desc');
  const [logToArchive, setLogToArchive] = useState<string | null>(null);
  const [previewLog, setPreviewLog] = useState<FlightLog | null>(null);

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
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'Sarah "Sky" Miller',
      role: 'Pilot',
      experience: 12,
      contact: { email: 'sarah@freesun.net', phone: '+1 555-0101' },
      certifications: ['Commercial LTA License', 'Flight Instructor', 'Night Rating'],
      bio: 'Lifelong aviation enthusiast with over 1,500 flight hours across three continents.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      availability: 'available'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Ground Crew',
      experience: 5,
      contact: { email: 'mike@freesun.net', phone: '+1 555-0102' },
      certifications: ['Crew Chief Certified', 'Emergency Response'],
      bio: 'Precision-focused ground lead.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      availability: 'busy'
    }
  ]);

  const filteredCrew = useMemo(() => {
    const isSearching = crewSearch.trim().length > 0;
    const items = crewMembers.filter(member => {
      const matchesRole = roleFilter === 'All' || member.role === roleFilter;
      const matchesExp = member.experience >= minExpFilter;
      const matchesCert = certTypeFilter === 'All' || member.certifications.some(c =>
        c.toLowerCase().includes(certTypeFilter.toLowerCase())
      );
      const matchesAvailability = availabilityFilter === 'All' || member.availability === availabilityFilter;

      if (!matchesRole || !matchesExp || !matchesCert || !matchesAvailability) return false;

      if (isSearching) {
        return calculateCrewRelevance(member, crewSearch) > -20;
      }
      return true;
    });

    if (isSearching) {
      return items.sort((a, b) => {
        const scoreA = calculateCrewRelevance(a, crewSearch);
        const scoreB = calculateCrewRelevance(b, crewSearch);
        return scoreB - scoreA;
      });
    }
    return items;
  }, [crewMembers, crewSearch, roleFilter, minExpFilter, certTypeFilter, availabilityFilter]);

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState<{
    date: string;
    duration: string;
    notes: string;
    site: string;
    attachments: LogAttachment[];
  }>({
    date: new Date().toISOString().split('T')[0],
    duration: '60',
    notes: '',
    site: 'Manual Entry',
    attachments: []
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
      site: 'Manual Entry',
      attachments: []
    });
  };

  const handleEditSave = (updated: CrewMember) => {
    setCrewMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
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
  const isHighWind = windSpeedValue > 15 || isSimulationMode;

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: 'status', label: 'Status', icon: CloudSun },
    { id: 'checklists', label: 'Checklists', icon: ListChecks },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'crew', label: 'Crew', icon: Users },
  ];

  const handleClearFilters = () => {
    setCrewSearch('');
    setRoleFilter('All');
    setMinExpFilter(0);
    setCertTypeFilter('All');
    setAvailabilityFilter('All');
  };

  return (
    <div className="container mx-auto px-4 sm:py-10 md:pt-20 md:pb-24 max-w-5xl grid grid-rows-[auto_1fr] grow">
      <ContextualTutorial 
        isOpen={showTutorial} 
        steps={pilotTutorialSteps} 
        onClose={completeTutorial} 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Welcome, Sarah</h1>
              <div className="flex items-center gap-1.5">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border dark:border-primary/30">
                  <Plane size={10} /> Pilot
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin size={14} /> Chatfield State Park (N 39.5448°, W 105.0874°)
            <span className="text-green-500 font-bold">• Active</span>
          </div>
        </div>
        <div id="navigation-tabs" className="flex items-center gap-1 p-1 bg-muted rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Rendering Container */}
      <div className="grow min-h-[500px]">
        {activeTab === 'status' && (
          <div className="space-y-6 flex flex-col animate-in fade-in duration-500">
            <WeatherAlertsList alerts={weatherAlerts} onDismiss={dismissAlert} />

            {isHighWind && showWindAlert && weatherAlerts.length === 0 && (
              <div className="bg-destructive/25 border-destructive/50 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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

            <div id="weather-section" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <WeatherCard icon={Wind} value={weatherData.wind} label="Surface Wind" isWarning={isHighWind} />
              <WeatherCard icon={Navigation} value={weatherData.direction} label="Direction" />
              <WeatherCard icon={CloudSun} value={weatherData.temp} label="Ambient Temp" />
              <WeatherCard icon={Search} value={weatherData.visibility} label="Visibility" />
            </div>

            <div className="bg-muted/30 border dark:border-primary/30 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h3 className="font-bold flex items-center gap-2 text-lg"><Clock size={18} className="text-primary" /> 3-Day Launch Outlook</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-1 rounded-lg mr-auto">
                  {isWeatherLoading ? <RefreshCw size={10} className="animate-spin text-primary" /> : <div className="w-2 h-2 rounded-full bg-green-500" />}
                  Live Sync {isWeatherLoading ? 'Updating' : 'Active'}
                </div>
                <div className="flex items-center justify-end gap-3 mb-2 ml-auto px-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Activity size={14} className={isSimulationMode ? "text-destructive animate-pulse" : "text-primary"} />
                    Simulation Mode
                  </div>
                  <button
                    onClick={() => {
                      setIsSimulationMode(!isSimulationMode);
                      if (isSimulationMode) setWeatherAlerts(prev => prev.filter(a => a.id !== 'sim-wind'));
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isSimulationMode ? 'bg-destructive' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isSimulationMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecastData.map((day, idx) => (
                  <ForecastCard key={idx} {...day} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BriefingCard
                  pilotContext={pilotContext}
                  setPilotContext={setPilotContext}
                  constraints={briefingConstraints}
                  setConstraints={setBriefingConstraints}
                  onGenerateBriefing={handleGenerateBriefing}
                  loadingBriefing={loadingBriefing}
                  briefing={briefing}
                  isManifestGenerated={isManifestGenerated}
                  isGeneratingManifest={isGeneratingManifest}
                  onGenerateManifest={handleGenerateManifest}
                  onResetManifest={() => setIsManifestGenerated(false)}
                  missionData={missionData}
                />
              </div>

              <div id="mission-section" className="bg-muted/30 border dark:border-primary/30 rounded-3xl p-6 flex flex-col">
                <div className="sticky top-[6rem]">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} /> Active Mission Summary</h3>
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-center border-b dark:border-primary/30 pb-4">
                      <span className="text-sm text-muted-foreground">Launch Window</span>
                      <span className="font-bold">06:15 AM</span>
                    </div>
                    <div className="flex justify-between items-center border-b dark:border-primary/30 pb-4">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="font-bold">{pilotContext.passengers} Adult(s)</span>
                    </div>
                    <div className="flex justify-between items-center border-b dark:border-primary/30 pb-4">
                      <span className="text-sm text-muted-foreground">Designated Vessel</span>
                      <span className="font-bold truncate max-w-[120px]">{pilotContext.balloon}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-8">
                    <div className="p-4 bg-background/50 border-2 border-dashed border-primary/20 rounded-2xl">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary mb-2">
                          <ShieldCheck size={14} /> Safety Integrity
                       </div>
                       <p className="text-xs text-muted-foreground leading-relaxed italic">
                          All pre-flight manifests are digitally sealed and logged to the club central operations unit.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><ListChecks /> Pre-Flight Checklist</h2>
              <span className="text-sm bg-muted px-2 py-1 rounded font-bold transition-all">{completedCount} / {checklists.length} Complete</span>
            </div>
            <div className="space-y-3">
              {checklists.map(item => (
                <div key={item.id} onClick={() => toggleChecklist(item.id)} className={`p-5 border dark:border-primary/30 rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${item.done ? 'bg-green-500/5 border-green-500/30' : 'bg-background hover:border-primary dark:border-primary/30'}`}>
                  <div className={`w-6 h-6 rounded-full border dark:border-primary/30 flex items-center justify-center transition-all duration-300 transform ${item.done ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-muted-foreground/30 scale-100'}`}>{item.done && <div className="animate-in zoom-in-50 duration-200"><CheckCircle size={16} /></div>}</div>
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
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-primary" /> Flight History</h2>
              <div className="flex flex-wrap items-center gap-4">
                <LogSortBar
                  sortField={logSortField}
                  sortOrder={logSortOrder}
                  onSortChange={(field, order) => {
                    setLogSortField(field);
                    setLogSortOrder(order);
                  }}
                />
                <button onClick={() => setIsAddingLog(!isAddingLog)} className="text-sm text-primary font-bold flex items-center gap-1 hover:underline">
                  {isAddingLog ? <X size={16} /> : <Plus size={16} />}
                  {isAddingLog ? 'Cancel Entry' : 'New Flight Log'}
                </button>
              </div>
            </div>
            
            {isAddingLog && (
              <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 shadow-inner">
                <form onSubmit={handleAddLog} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Calendar size={12} /> Flight Date</label>
                      <input type="date" required value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><Timer size={12} /> Duration (Min)</label>
                      <input type="number" required min="1" value={newLog.duration} onChange={(e) => setNewLog({ ...newLog, duration: e.target.value })} className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                  </div>

                  <LogMediaUpload
                    onMediaChange={(attachments) => setNewLog({ ...newLog, attachments })}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1"><FileText size={12} /> Mission Notes</label>
                    <textarea placeholder="Enter landing details or observations..." value={newLog.notes} onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })} className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddingLog(false)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all">Discard</button>
                    <button type="submit" className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Archive Entry</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {sortedLogs.map(log => (
                <LogCard
                  key={log.id}
                  log={log}
                  onArchive={(id) => setLogToArchive(id)}
                  onPreview={(l) => setPreviewLog(l)}
                />
              ))}
              {sortedLogs.length === 0 && (
                <div className="py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
                  <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold text-muted-foreground">No historical logs found</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'crew' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-6">              
              <div className="w-full">
                <CrewFilterBar
                  search={crewSearch}
                  onSearchChange={setCrewSearch}
                  roleFilter={roleFilter}
                  onRoleFilterChange={setRoleFilter}
                  expFilter={minExpFilter}
                  onExpFilterChange={setMinExpFilter}
                  certFilter={certTypeFilter}
                  onCertFilterChange={setCertTypeFilter}
                  availabilityFilter={availabilityFilter}
                  onAvailabilityFilterChange={setAvailabilityFilter}
                  onClearAll={handleClearFilters}
                />
              </div>
            </div>

            {filteredCrew.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
                <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">No crew members match your search</h3>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Hub Section */}
        <MaintenanceHub 
          logs={maintenanceLogs}
          onAdd={handleAddMaintenance}
          onUpdate={handleUpdateMaintenance}
          onDelete={handleDeleteMaintenance}
          balloons={balloonsList}
        />
      </div>

      {/* Global Drawers & Modals */}
      <Drawer
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title={editingMember ? `Edit Profile: ${editingMember.name}` : 'Edit Profile'}
      >
        {editingMember && (
          <CrewProfileForm
            member={editingMember}
            onUpdate={handleEditSave}
            onCancel={() => setEditingMember(null)}
          />
        )}
      </Drawer>

      <ConfirmationModal
        isOpen={logToArchive !== null}
        onClose={() => setLogToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Flight Log"
        message="Are you sure you want to archive this entry? It will remain in the database but be moved to permanent storage."
        confirmText="Archive Log"
        variant="danger"
      />

      <LogDetailDrawer
        log={previewLog}
        onClose={() => setPreviewLog(null)}
      />
    </div>
  );
};

export default Dashboard;
