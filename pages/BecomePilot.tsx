
import React, { useEffect } from 'react';
import { BookOpen, Navigation, Zap, Map, ArrowRight, Target, Sparkles, GraduationCap } from 'lucide-react';

const BecomePilot: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: 'Ground School',
      desc: 'Master the theory of flight, meteorology, and FAA regulations in our private Littleton hangar.',
      icon: <BookOpen />,
      badge: 'Step 01'
    },
    {
      title: 'The First Burn',
      desc: 'Hands-on instruction. Learn to manage fuel levels, thermal control, and envelope inflation.',
      icon: <Zap />,
      badge: 'Step 02'
    },
    {
      title: 'Command Hours',
      desc: 'Log 35+ hours of supervised flight time under the guidance of our Master Pilots.',
      icon: <Navigation />,
      badge: 'Step 03'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-muted/20 border-b dark:border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
            <GraduationCap size={14} /> Flight School
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6">Earn Your <span className="text-primary italic">Wings</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic leading-relaxed">
            FreeSun operates one of the most prestigious ballooning schools in the country. We don't just teach you to fly—we teach you to master the winds.
          </p>
        </div>
      </section>

      {/* The Journey Section - Alternating Layout B style */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-[2rem] -z-10 animate-pulse" />
              <div className="rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl transform -rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1544391681-9964893796fc?auto=format&fit=crop&q=80&w=1200" 
                  alt="Pilot Training" 
                  className="w-full h-full object-cover aspect-[4/5]"
                />
              </div>
              <div className="absolute top-20 -left-10 bg-background border dark:border-primary/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-500 delay-500 max-w-[200px]">
                <div className="text-primary mb-2"><Sparkles size={24} /></div>
                <div className="text-sm font-bold leading-tight italic">"The silence at 4,000ft is where I found my clarity."</div>
                <div className="text-[10px] font-black uppercase text-muted-foreground mt-2">— Class of 2023</div>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                  <Map size={14} /> Training Path
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">From Ground to Horizon</h2>
                <p className="text-lg text-muted-foreground leading-relaxed italic">
                  Our comprehensive Pilot-In-Command (PIC) curriculum covers everything from micro-meteorology to advanced mountain terrain recovery.
                </p>
              </div>

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-primary uppercase tracking-widest">{step.badge}</div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button className="px-10 py-5 bg-primary text-white font-black text-lg rounded-2xl hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl shadow-primary/20 flex items-center gap-3">
                  Enroll in Autumn Session <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials or Stats */}
      <section className="py-24 bg-muted/20 border-y dark:border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-5xl font-black italic mb-2">35+</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mandatory Flight Hours</div>
            </div>
            <div>
              <div className="text-5xl font-black italic mb-2">100%</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">FAA Certification Pass Rate</div>
            </div>
            <div>
              <div className="text-5xl font-black italic mb-2">1:1</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Instructor to Student Ratio</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomePilot;
