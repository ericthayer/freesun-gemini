
import React, { useEffect, useMemo } from 'react';
import { Wind, Users, Zap, Compass, ArrowRight, Gauge } from 'lucide-react';
import { CrewShowcase } from '../components/CrewShowcase';
import { useBalloons } from '../hooks/useBalloons';

const Fleet: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { balloons } = useBalloons();

  const fleetItems = useMemo(() =>
    balloons
      .filter(b => b.type && b.image_url)
      .map(b => ({
        name: b.name.replace(/\s*\(.*\)/, ''),
        type: b.type,
        description: b.description,
        stats: { volume: b.volume, capacity: b.capacity, burner: b.burner },
        image: b.image_url,
      })),
    [balloons]
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Wind size={14} /> The FreeSun Hangar
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 uppercase italic">Fleet & <span className="text-primary">Crew</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto italic">
            A collection of world-class aeronautical engineering and the elite team of aeronauts that master the winds.
          </p>
        </div>
      </section>

      {/* Fleet Listing - Alternating Layouts */}
      {fleetItems.map((item, index) => (
        <section key={index} className={`py-32 ${index % 2 !== 0 ? 'bg-muted/30' : 'bg-background'}`}>
          <div className="container mx-auto px-4">
            <div className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
              {/* Image Side */}
              <div className="lg:w-1/2 relative">
                <div className={`absolute -top-6 ${index % 2 !== 0 ? '-right-6' : '-left-6'} w-32 h-32 bg-primary/10 rounded-[2rem] -z-10 animate-pulse`} />
                <div className={`rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl transition-transform hover:scale-[1.02] duration-500 ${index % 2 !== 0 ? '-rotate-2' : 'rotate-2'}`}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover aspect-[16/10]"
                  />
                </div>
                <div className={`absolute -bottom-10 ${index % 2 !== 0 ? '-left-10' : '-right-10'} bg-background border dark:border-primary/30 p-8 rounded-[2.5rem] shadow-2xl z-20 hidden md:block`}>
                  <div className="flex items-center gap-4">
                    <div className="text-primary"><Gauge size={32} /></div>
                    <div>
                      <div className="text-2xl font-black italic">{item.stats.volume}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Lift Capacity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <div className="text-sm font-black text-primary uppercase tracking-[0.2em]">{item.type}</div>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight">{item.name}</h2>
                  <p className="text-lg text-muted-foreground italic leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-background/50 border dark:border-primary/30 rounded-3xl">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1"><Users size={16} /> Capacity</div>
                    <div className="text-xl font-black">{item.stats.capacity}</div>
                  </div>
                  <div className="p-6 bg-background/50 border dark:border-primary/30 rounded-3xl">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1"><Zap size={16} /> Burner System</div>
                    <div className="text-xl font-black">{item.stats.burner}</div>
                  </div>
                </div>

                <button className="inline-flex items-center gap-3 text-primary font-black text-xl hover:translate-x-2 transition-all group">
                  Flight Logistics Detail <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* New Freesun Crew Section */}
      <CrewShowcase />
    </div>
  );
};

export default Fleet;
