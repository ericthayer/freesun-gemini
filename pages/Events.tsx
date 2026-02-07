
import React, { useEffect } from 'react';
import { Calendar, Users, MapPin, ArrowRight, Camera, GlassWater, Trophy } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

const eventIconMap: Record<string, React.ReactNode> = {
  'Flight Gala': <Users className="text-primary" />,
  'Social': <GlassWater className="text-primary" />,
  'Training': <Trophy className="text-primary" />,
};

const Events: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { events: dbEvents } = useEvents();

  const events = dbEvents.map(e => ({
    title: e.title,
    date: e.date,
    type: e.type,
    desc: e.description,
    icon: eventIconMap[e.type] || <Calendar className="text-primary" />,
    image: e.image_url,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Calendar size={14} /> The Social Calendar
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6">Member <span className="text-primary italic">Gatherings</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic">
            Beyond the flight, FreeSun is a community. Join us for exclusive galas, safety seminars, and sunrise chasing.
          </p>
        </div>
      </section>

      {/* Featured Event Card - Layout B variation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-muted/30 border dark:border-primary/30 rounded-[3.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 text-primary/5 pointer-events-none">
              <Users size={400} />
            </div>
            
            <div className="lg:w-1/2 relative z-10">
              <div className="rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl transform -rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=1200" 
                  alt="Main Event" 
                  className="w-full h-full object-cover aspect-video"
                />
              </div>
            </div>

            <div className="lg:w-1/2 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                Next Highlight • Oct 30
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight italic">The Sky Lantern Festival</h2>
              <p className="text-lg text-muted-foreground italic">
                A night-time gathering celebrating the history of unpowered flight. Members-only tethered glow session and dinner.
              </p>
              <button className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                RSVP for the Festival
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <div key={i} className="group bg-muted/20 border dark:border-primary/30 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                    {event.type}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Calendar size={14} className="text-primary" /> {event.date}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {event.desc}
                  </p>
                  <div className="pt-4">
                    <button className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:translate-x-1 transition-transform">
                      View Event Page <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events Gallery - Layout A variation */}
      <section className="py-24 bg-muted/20 border-t dark:border-primary/30">
        <div className="container mx-auto px-4">
           <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-6">
                 <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">Captured <span className="text-primary italic">Moments</span></h2>
                 <p className="text-lg text-muted-foreground italic leading-relaxed">
                   Relive the heights of last season. Browse our community-sourced gallery from the Spring Ascension Series.
                 </p>
                 <button className="inline-flex items-center gap-3 text-primary font-black text-xl hover:translate-x-2 transition-all group">
                   Browse Member Gallery <Camera />
                 </button>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[2rem] overflow-hidden border-4 border-background shadow-xl transform -rotate-2">
                    <img src="https://images.unsplash.com/photo-1544391681-9964893796fc?auto=format&fit=crop&q=80&w=400" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-[2rem] overflow-hidden border-4 border-background shadow-xl transform rotate-3">
                    <img src="https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=400" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-[2rem] overflow-hidden border-4 border-background shadow-xl transform rotate-2 col-span-2">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
