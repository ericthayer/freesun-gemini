
import React, { useEffect } from 'react';
import { ShieldCheck, Award, CheckCircle2, History, AlertTriangle, FileText } from 'lucide-react';

const SafetyRecords: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="bg-muted/30 py-24 border-b dark:border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-500/20">
            <ShieldCheck size={14} /> Zero Incident Record
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Our Safety <span className="text-primary italic">Legacy</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic leading-relaxed">
            In ballooning, safety isn't a goal—it's the absolute foundation. We maintain the highest inspection standards in the Rockies.
          </p>
        </div>
      </section>

      {/* Main Content - About Us style treatment */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-[2rem] -z-10 animate-pulse" />
              <div className="rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl transform rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200" 
                  alt="Rigorous Inspection" 
                  className="w-full h-full object-cover aspect-[4/5]"
                />
              </div>
              <div className="absolute bottom-10 -left-10 bg-background border dark:border-primary/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-500 delay-500">
                <div className="text-4xl font-black text-green-500 mb-1 italic">100%</div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pre-Flight Pass Rate</div>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                <Award size={14} /> Certified Excellence
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Rigorous Maintenance Protocols</h2>
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                Every envelope in our fleet undergoes a comprehensive 100-hour inspection by FAA-certified mechanics. We retire equipment 25% earlier than industry recommendations to ensure absolute structural integrity.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 font-bold text-lg">
                    <CheckCircle2 className="text-green-500" /> Daily Burner Tests
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Multiple redundancy checks on fuel lines and double-burner sync before every launch.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 font-bold text-lg">
                    <AlertTriangle className="text-amber-500" /> Weather Minimums
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our safety thresholds for surface winds are strictly lower than FAA mandates. No exceptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - "Mix it up" layout */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-background border dark:border-primary/30 rounded-[3rem] shadow-xl transform hover:-translate-y-2 transition-transform">
              <div className="text-6xl font-black text-primary mb-4 italic">25k+</div>
              <h4 className="text-xl font-bold mb-2 uppercase tracking-tighter">Safe Flight Hours</h4>
              <p className="text-sm text-muted-foreground italic">Logged since our founding in 1994 without a single major incident.</p>
            </div>
            <div className="text-center p-8 bg-background border dark:border-primary/30 rounded-[3rem] shadow-xl transform hover:-translate-y-2 transition-transform">
              <div className="text-6xl font-black text-primary mb-4 italic">120+</div>
              <h4 className="text-xl font-bold mb-2 uppercase tracking-tighter">Certified Pilots</h4>
              <p className="text-sm text-muted-foreground italic">All FreeSun pilots undergo bi-annual competency evaluations.</p>
            </div>
            <div className="text-center p-8 bg-background border dark:border-primary/30 rounded-[3rem] shadow-xl transform hover:-translate-y-2 transition-transform">
              <div className="text-6xl font-black text-primary mb-4 italic">0.0</div>
              <h4 className="text-xl font-bold mb-2 uppercase tracking-tighter">Accident Rate</h4>
              <p className="text-sm text-muted-foreground italic">Maintaining an unblemished record in the challenging mountain air.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Official Documentation</h2>
            <p className="text-muted-foreground italic">We operate with transparency. Request any safety log from our operations desk.</p>
          </div>
          <div className="space-y-4">
            {['Annual Safety Audit 2024', 'FAA Part 141 Compliance Certification', 'Emergency Response Protocol - Rev 4', 'Pilot Qualification Standards'].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-muted/50 border dark:border-primary/30 rounded-2xl hover:bg-muted transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="text-primary" />
                  <span className="font-bold">{doc}</span>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Request PDF</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SafetyRecords;
