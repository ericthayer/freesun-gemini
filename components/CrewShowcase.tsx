
import React, { useState } from 'react';
import { 
  Users, Plane, Award, MapPin, Search, 
  X, ChevronLeft, ChevronRight, Maximize2, 
  Info, History, Heart, Sparkles 
} from 'lucide-react';

interface ShowcaseMember {
  id: string;
  name: string;
  role: 'Pilot' | 'Ground Crew';
  experience: string;
  flights: number;
  specialty: string;
  imageUrl: string;
  bio: string;
}

const crewData: ShowcaseMember[] = [
  {
    id: '1',
    name: 'Sarah "Sky" Miller',
    role: 'Pilot',
    experience: '12 Years',
    flights: 1540,
    specialty: 'High Altitude Navigation',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    bio: 'Sarah is the club chief pilot, specializing in long-distance valley traverses and high-altitude weather pattern recognition.'
  },
  {
    id: '2',
    name: 'David Thorne',
    role: 'Pilot',
    experience: '20 Years',
    flights: 2800,
    specialty: 'Emergency Recovery',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
    bio: 'A master of the mountain winds, David has navigated nearly every peak in the Rockies and leads our safety training seminars.'
  },
  {
    id: '3',
    name: 'Mike Chen',
    role: 'Ground Crew',
    experience: '5 Years',
    flights: 420,
    specialty: 'Cold Inflation Lead',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    bio: 'Mike ensures the technical readiness of every envelope before dawn breaks.'
  },
  {
    id: '4',
    name: 'Elena Rodriguez',
    role: 'Ground Crew',
    experience: '3 Years',
    flights: 210,
    specialty: 'Chase Navigation',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    bio: 'Elena is the best in the business at predicting landing zones and leading recovery vehicles through rough terrain.'
  },
  {
    id: '5',
    name: 'Tom Wilson',
    role: 'Ground Crew',
    experience: '8 Years',
    flights: 680,
    specialty: 'Burner Maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    bio: 'Tom keeps the fire going, literally. He oversees our maintenance hangar with surgical precision.'
  },
  {
    id: '6',
    name: 'Linda Gao',
    role: 'Ground Crew',
    experience: '4 Years',
    flights: 315,
    specialty: 'Passenger Safety',
    imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=600',
    bio: 'Linda ensures that every guest feels safe and informed from pre-flight to landing toast.'
  },
  {
    id: '7',
    name: 'James Peterson',
    role: 'Ground Crew',
    experience: '6 Years',
    flights: 550,
    specialty: 'Envelope Repair',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    bio: 'James manages our workshop, ensuring the integrity of every square inch of silk in the hangar.'
  },
  {
    id: '8',
    name: 'Sofia Rossi',
    role: 'Ground Crew',
    experience: '2 Years',
    flights: 145,
    specialty: 'Logistics Liaison',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    bio: 'Sofia coordinates the complex dance between pilots, ground crew, and local field permits.'
  },
  {
    id: '9',
    name: 'Marcus Wright',
    role: 'Ground Crew',
    experience: '10 Years',
    flights: 920,
    specialty: 'Team Coordination',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    bio: 'A veteran of the ground operations, Marcus oversees the workflow of our field base teams.'
  }
];

export const CrewShowcase: React.FC = () => {
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  const openSlideshow = (index: number) => setSlideshowIndex(index);
  const closeSlideshow = () => setSlideshowIndex(null);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slideshowIndex === null) return;
    setSlideshowIndex((slideshowIndex + 1) % crewData.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slideshowIndex === null) return;
    setSlideshowIndex((slideshowIndex - 1 + crewData.length) % crewData.length);
  };

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Users size={14} /> The Freesun Crew
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 uppercase italic">Meet the <span className="text-primary">Aeronauts</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
            The pilots and ground operations team that make every sunrise mission possible.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {crewData.map((member, index) => {
            const isPilot = member.role === 'Pilot';
            return (
              <div 
                key={member.id}
                className={`group relative rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 shadow-xl cursor-pointer ${
                  isPilot ? 'lg:col-span-2 lg:row-span-2 row-span-2' : 'col-span-1 row-span-1'
                }`}
                onClick={() => openSlideshow(index)}
              >
                {/* Member Image */}
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />

                {/* Pilot Badge Overlay */}
                {isPilot && (
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Plane size={12} /> Chief Pilot
                    </span>
                  </div>
                )}

                {/* Default Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:translate-y-full transition-transform duration-500">
                  <div className="text-white">
                    <h3 className={`font-bold ${isPilot ? 'text-3xl' : 'text-xl'}`}>{member.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/80">{member.role}</p>
                  </div>
                </div>

                {/* Hover Detailed Content Overlay */}
                <div className="absolute inset-0 bg-primary/95 text-white p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-between backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold italic ${isPilot ? 'text-4xl' : 'text-2xl'}`}>{member.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{member.role}</p>
                      </div>
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Sparkles size={isPilot ? 24 : 16} />
                      </div>
                    </div>
                    
                    <p className={`italic leading-relaxed ${isPilot ? 'text-base' : 'text-xs line-clamp-3'}`}>
                      "{member.bio}"
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                      <div>
                        <div className="text-[9px] font-black uppercase opacity-60">Experience</div>
                        <div className="font-bold text-lg">{member.experience}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase opacity-60">Flight Hours</div>
                        <div className="font-bold text-lg">{member.flights}+</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button className="flex-grow py-3 bg-white text-primary font-bold text-xs rounded-xl hover:bg-slate-100 transition-all active:scale-95">
                      Full Profile
                    </button>
                    <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
           <button 
            onClick={() => openSlideshow(0)}
            className="inline-flex items-center gap-2 px-10 py-5 bg-background border-2 border-primary/20 text-primary font-black text-lg rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            Launch Gallery Experience <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Slideshow Lightbox */}
      {slideshowIndex !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={closeSlideshow} />
          
          <button 
            onClick={closeSlideshow}
            className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-all z-[1001]"
          >
            <X size={32} />
          </button>

          <div className="relative w-full max-w-6xl h-full flex flex-col lg:flex-row items-center gap-10 z-[1001] animate-in zoom-in-95 duration-500">
            {/* Nav Left */}
            <button 
              onClick={prevSlide}
              className="hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Photo Section */}
            <div className="lg:w-2/3 h-full max-h-[70vh] lg:max-h-full flex items-center justify-center bg-black/40 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
              <img 
                src={crewData[slideshowIndex].imageUrl} 
                alt={crewData[slideshowIndex].name}
                className="w-full h-full object-cover animate-in fade-in duration-700"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
              
              {/* Mobile Nav */}
              <div className="lg:hidden absolute bottom-6 flex gap-4">
                <button onClick={prevSlide} className="p-4 bg-black/60 backdrop-blur rounded-full text-white"><ChevronLeft /></button>
                <button onClick={nextSlide} className="p-4 bg-black/60 backdrop-blur rounded-full text-white"><ChevronRight /></button>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/3 text-white space-y-8 animate-in slide-in-from-right-8 duration-500 delay-200">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {crewData[slideshowIndex].role === 'Pilot' ? <Plane size={10} /> : <Users size={10} />}
                  {crewData[slideshowIndex].role}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter italic leading-none">{crewData[slideshowIndex].name}</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Flight Log Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                      <div className="text-primary font-black text-2xl italic">{crewData[slideshowIndex].experience}</div>
                      <div className="text-[9px] font-bold uppercase text-white/60">Professional Rank</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                      <div className="text-primary font-black text-2xl italic">{crewData[slideshowIndex].flights}</div>
                      <div className="text-[9px] font-bold uppercase text-white/60">Missions Logged</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Core Specialization</h4>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl italic text-lg">
                    <Sparkles className="text-primary shrink-0" size={20} />
                    {crewData[slideshowIndex].specialty}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Aeronautical Background</h4>
                  <p className="text-white/70 italic leading-relaxed text-lg">
                    "{crewData[slideshowIndex].bio}"
                  </p>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button className="flex-grow py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Inquire for Launch
                </button>
                <button className="p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {/* Nav Right */}
            <button 
              onClick={nextSlide}
              className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
