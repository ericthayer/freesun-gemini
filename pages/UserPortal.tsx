
import React, { useEffect } from 'react';
import { 
  Award, Plane, Timer, MapPin, 
  ChevronRight, Calendar, Star, 
  ShieldCheck, ArrowUpRight, History,
  TrendingUp, Users, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserPortal: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock personal data
  const userData = {
    name: "Sarah Miller",
    role: "Chief Pilot",
    since: "2012",
    stats: [
      { label: "Flight Hours", value: "1,540", icon: Timer },
      { label: "Missions", value: "412", icon: Plane },
      { label: "Safe Landings", value: "100%", icon: ShieldCheck },
      { label: "Crew Lead", value: "84", icon: Users },
    ],
    achievements: [
      { title: "Master of the Rockies", date: "June 2023", icon: Star, color: "text-amber-500" },
      { title: "1000h Service", date: "Sept 2022", icon: Award, color: "text-blue-500" },
      { title: "Night Ops Certified", date: "Jan 2021", icon: ShieldCheck, color: "text-purple-500" },
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl animate-in fade-in duration-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
        <div className="relative">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] overflow-hidden border-8 border-muted/30 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" 
              alt={userData.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl">
            <Award size={24} />
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-4 pt-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-2">
              {userData.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                {userData.role}
              </span>
              <span className="text-muted-foreground text-sm font-bold flex items-center gap-2">
                <Calendar size={14} /> Active since {userData.since}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-lg italic max-w-xl">
            "Pushing the ceiling of what's possible in the mountain air. Every sunrise is a new lesson in tranquility."
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {userData.stats.map((stat, i) => (
          <div key={i} className="bg-muted/30 border dark:border-primary/20 p-6 rounded-[2rem] hover:bg-muted/50 transition-all group">
            <stat.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={24} />
            <div className="text-3xl font-black italic">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Achievements Column */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-2">
            <Star className="text-primary" size={20} /> Professional Badges
          </h3>
          <div className="space-y-3">
            {userData.achievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-background border dark:border-primary/20 rounded-2xl group hover:border-primary/40 transition-all">
                <div className={`p-3 rounded-xl bg-muted ${ach.color}`}>
                  <ach.icon size={24} />
                </div>
                <div>
                  <div className="font-bold text-sm">{ach.title}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{ach.date}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:border-primary/50 hover:text-primary transition-all">
            View All Credentials
          </button>
        </div>

        {/* Quick Links & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 px-2">
              <Target className="text-primary" size={20} /> Personal Hub Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/dashboard" 
                className="group p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                <Plane className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
                <h4 className="text-2xl font-black italic mb-2 relative z-10">Pilot Dashboard</h4>
                <p className="text-white/70 text-sm mb-6 relative z-10">Manage checklists, logs, and live weather telemetry.</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest relative z-10">
                  Open Operations <ArrowUpRight size={14} />
                </div>
              </Link>

              <div className="p-8 bg-muted/30 border dark:border-primary/20 rounded-[2.5rem] hover:bg-muted/50 transition-all group">
                <History className="text-primary mb-4" size={32} />
                <h4 className="text-2xl font-black italic mb-2">My Flight Logs</h4>
                <p className="text-muted-foreground text-sm mb-6">Review 412 missions and personal flight performance.</p>
                <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  View History <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-muted/30 border dark:border-primary/20 p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} /> Growth Trajectory
              </h3>
              <div className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                Level 22 Senior Pilot
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                  <span>Progress to Master Pilot Rank</span>
                  <span className="text-primary">82%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: '82%' }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                You need 14 more instruction hours and one seasonal evaluation to achieve the next seniority rank.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
