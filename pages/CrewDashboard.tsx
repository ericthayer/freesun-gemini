
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, Calendar, Plane, Award, MapPin, Mail, Phone, 
  Settings, LogOut, CheckCircle2, Circle, Clock, ChevronRight,
  Briefcase, X, ArrowRight, AlertCircle, Users, CloudSun, Wind, Navigation, Search, RefreshCw, Sun, Cloud, Bell, Globe, Shield
} from 'lucide-react';
import { CrewMember } from '../components/CrewUI';
import { CrewProfileForm } from '../components/CrewProfileForm';
import { ScheduleItem, ScheduleCard } from '../components/ScheduleUI';
import { WeatherCard, ForecastCard } from '../components/StatusUI';
import { fetchLiveWeather, detectWeatherAlerts, WeatherSnapshot, WeatherAlert } from '../services/weatherService';
import { WeatherAlertsList } from '../components/WeatherAlertsUI';

type CrewTabType = 'status' | 'profile' | 'schedule' | 'settings';

const CrewDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CrewTabType>('status');
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const lastSnapshot = useRef<WeatherSnapshot | null>(null);

  // Weather State
  const [weatherData, setWeatherData] = useState({
    temp: '68°F',
    wind: '0 mph',
    direction: 'CALM',
    visibility: '10 mi'
  });

  // Simulating the "logged-in" crew member
  const [me, setMe] = useState<CrewMember>({
    id: '4',
    name: 'Elena Rodriguez',
    role: 'Ground Crew',
    experience: 3,
    contact: { email: 'elena@freesun.net', phone: '+1 555-0104' },
    certifications: ['Recovery Specialist', 'Radio Communications', 'FAA Ground Handling'],
    bio: 'Expert navigator and recovery lead. Specialist in high-wind envelope recovery and vineyard landing zones.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    availability: 'available'
  });

  // Assignments
  const [myAssignments] = useState<ScheduleItem[]>([
    {
      id: 's1',
      type: 'flight',
      title: 'Valley Mist Morning Ride',
      date: '2026-01-13',
      time: '06:15',
      location: 'South Ridge Launch Site',
      description: 'Standard tourist flight for 4 passengers. Ground crew arrival at 05:30 for cold inflation.',
      attendees: 4
    }
  ]);

  // Weather Polling logic mirrored from Pilot Dashboard
  useEffect(() => {
    const updateWeather = async () => {
      setIsWeatherLoading(true);
      try {
        const coords = { lat: 38.2975, lon: -122.4579 };
        const weatherApiKey = (process.env as any).WEATHER_API_KEY || 'FREE_SUN_MOCK_KEY';
        const snapshot = await fetchLiveWeather(coords.lat, coords.lon, weatherApiKey);
        
        setWeatherData({
          temp: snapshot.temp,
          wind: `${snapshot.windSpeed} mph`,
          direction: snapshot.windDirection,
          visibility: snapshot.visibility
        });

        const newAlerts = detectWeatherAlerts(snapshot, lastSnapshot.current);
        if (newAlerts.length > 0) {
          setWeatherAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
        }
        lastSnapshot.current = snapshot;
      } catch (err) {
        console.error("Weather sync failed", err);
      } finally {
        setIsWeatherLoading(false);
      }
    };

    updateWeather();
    const intervalId = window.setInterval(updateWeather, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateProfile = (updated: CrewMember) => {
    setMe(updated);
    setActiveTab('status');
  };

  const isAvailable = me.availability === 'available';
  const nextAssignment = myAssignments[0];

  const tabs: {id: CrewTabType, label: string, icon: any}[] = [
    {id: 'status', label: 'Overview', icon: Plane},
    {id: 'profile', label: 'Profile', icon: User},
    {id: 'schedule', label: 'Schedule', icon: Calendar},
    {id: 'settings', label: 'Settings', icon: Settings},
  ];

  const forecastData = [
    { day: 'Tomorrow', condition: 'Clear', temp: '72° / 54°', wind: '4-6 mph', icon: Sun },
    { day: 'Wednesday', condition: 'Partly Cloudy', temp: '69° / 52°', wind: '5-9 mph', icon: CloudSun },
    { day: 'Thursday', condition: 'Cloudy', temp: '64° / 48°', wind: '8-12 mph', icon: Cloud },
  ];

  return (
    <div className="container mx-auto px-4 sm:py-10 md:pt-20 md:pb-24 max-w-5xl grid grid-rows-[auto_1fr] grow animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Welcome, {me.name.split(' ')[0]}</h1>
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-primary/20">
              <Users size={10} /> Crew
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin size={14} /> Chatfield State Park (N 39.5448°, W 105.0874°)
            <span className="text-green-500 font-bold">• Active</span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl overflow-x-auto no-scrollbar">
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

      {/* Status Tab (Overview) */}
      {activeTab === 'status' && (
        <div className="space-y-6 flex flex-col">
          <WeatherAlertsList alerts={weatherAlerts} onDismiss={(id) => setWeatherAlerts(prev => prev.filter(a => a.id !== id))} />

          {/* Metric Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WeatherCard icon={Wind} value={weatherData.wind} label="Surface Wind" />
            <WeatherCard icon={Navigation} value={weatherData.direction} label="Direction" />
            <WeatherCard icon={CloudSun} value={weatherData.temp} label="Ambient Temp" />
            <WeatherCard icon={Search} value={weatherData.visibility} label="Visibility" />
          </div>

          {/* Launch Outlook */}
          <div className="bg-muted/30 border border-primary/30 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-lg"><Clock size={18} className="text-primary" /> 3-Day Launch Outlook</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                {isWeatherLoading ? <RefreshCw size={10} className="animate-spin text-primary" /> : <div className="w-2 h-2 rounded-full bg-green-500" />}
                Live Sync {isWeatherLoading ? 'Updating' : 'Active'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecastData.map((day, idx) => (
                <ForecastCard key={idx} {...day} />
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 grow">
            {/* My Profile Card (Col-span 2) */}
            <div className="lg:col-span-2 bg-muted/30 border border-primary/30 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
               <div className="absolute -right-4 -top-4 text-primary/5 pointer-events-none">
                <Users size={160} />
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-muted/50 mb-6 shadow-2xl shrink-0">
                    <img src={me.imageUrl} alt={me.name} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => setMe(prev => ({ ...prev, availability: isAvailable ? 'busy' : 'available' }))}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all border ${
                      isAvailable 
                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {isAvailable ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    {isAvailable ? 'Available for Launch' : 'Set Available'}
                  </button>
                </div>

                <div className="flex-grow space-y-6">
                  <div>
                    <h2 className="text-4xl font-black italic tracking-tight mb-1">{me.name}</h2>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest">{me.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/60 backdrop-blur border border-primary/20 p-4 rounded-2xl">
                      <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Experience</div>
                      <div className="text-xl font-bold">{me.experience} Yrs</div>
                    </div>
                    <div className="bg-background/60 backdrop-blur border border-primary/20 p-4 rounded-2xl">
                      <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Flights</div>
                      <div className="text-xl font-bold">142</div>
                    </div>
                  </div>

                  <div className="bg-background/40 p-6 rounded-[2rem] border border-dashed border-primary/30">
                    <p className="text-muted-foreground text-sm italic leading-relaxed">"{me.bio}"</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Award size={14} className="text-primary" /> Key Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {me.certifications.map((cert, idx) => (
                        <div key={idx} className="bg-background border-2 border-primary/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm transition-hover hover:border-primary/30">
                          <span className="font-bold text-xs">{cert}</span>
                          <CheckCircle2 size={12} className="text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Duty Card (Col-span 1) */}
            <div className="bg-muted/30 border border-primary/30 rounded-[2.5rem] p-6 flex flex-col">
              <div className="sticky top-[6rem]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Clock size={18} className="text-primary" /> Active Assignments</h3>
                
                {nextAssignment ? (
                  <div className="space-y-6">
                    <div className="bg-background/60 border-2 border-primary/20 p-6 rounded-[2rem] group hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-primary/20">
                          {nextAssignment.type}
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} /> {nextAssignment.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-xl mb-4 group-hover:text-primary transition-colors">{nextAssignment.title}</h4>
                      <div className="space-y-3 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-3"><Clock size={14} className="text-primary" /> {nextAssignment.time} Launch</div>
                        <div className="flex items-center gap-3"><MapPin size={14} className="text-primary" /> {nextAssignment.location}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full py-4 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all active:scale-[0.98]">
                        View Mission Logistics
                      </button>
                      <button 
                        onClick={() => setActiveTab('schedule')}
                        className="w-full py-4 border-2 border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                      >
                        Browse All Shifts <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background/40 border-2 border-dashed border-muted rounded-[2rem] p-12 text-center">
                    <AlertCircle size={32} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm italic">No flights currently assigned.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab (Edit Form) */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl mx-auto w-full">
           <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Crew Profile Settings</h2>
            <button onClick={() => setActiveTab('status')} className="text-sm font-bold text-muted-foreground hover:text-primary"><X size={18} /></button>
          </div>
          <div className="bg-background border rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <CrewProfileForm 
              member={me} 
              onUpdate={handleUpdateProfile} 
              onCancel={() => setActiveTab('status')}
            />
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calendar className="text-primary" /> Flight Duty Calendar
            </h2>
            <div className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
              {myAssignments.length} Assignments Confirmed
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map(item => (
              <ScheduleCard key={item.id} item={item} />
            ))}
          </div>
          <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-12 text-center">
            <Users size={40} className="mx-auto text-primary/40 mb-4" />
            <h3 className="font-bold text-xl mb-2">Need More Shifts?</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">Check the club marketplace for open recovery and ground handling opportunities this weekend.</p>
            <button className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Claim Open Shifts
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto w-full space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="text-primary" /> App Preferences
          </h2>
          
          <div className="bg-muted/20 border border-primary/20 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Bell size={14} /> Notifications
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border cursor-pointer hover:bg-background transition-colors">
                    <span className="font-bold text-sm">Instant Weather Alerts</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border cursor-pointer hover:bg-background transition-colors">
                    <span className="font-bold text-sm">Shift Reminders (2h Prior)</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Globe size={14} /> Operational Units
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">
                    Imperial (F, mph, ft)
                  </button>
                  <button className="p-4 bg-background border rounded-2xl font-bold text-sm hover:bg-muted transition-colors">
                    Metric (C, kph, m)
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Shield size={14} /> Account & Privacy
                </h4>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-background border rounded-2xl font-bold text-sm text-left hover:bg-muted transition-colors flex justify-between items-center">
                    Change Access Pin <ChevronRight size={16} />
                  </button>
                  <button className="w-full p-4 bg-destructive/10 text-destructive border-destructive/20 border rounded-2xl font-bold text-sm text-left hover:bg-destructive/20 transition-colors flex justify-between items-center">
                    Revoke App Access <LogOut size={16} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CrewDashboard;
