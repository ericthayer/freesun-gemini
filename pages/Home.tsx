
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Added missing Users icon import
import { ArrowRight, MapPin, Calendar, Shield, Wind, Sparkles, X, History, Compass, Target, CheckCircle2, Users } from 'lucide-react';
import { CrewSignUpForm } from '../components/CrewSignUpForm';

interface HomeProps {
  isLoggedIn: boolean;
}

const Home: React.FC<HomeProps> = ({ isLoggedIn }) => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const scrollToAbout = () => {
    const element = document.getElementById('about-us');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://assets.codepen.io/97621/IMG_8276.jpg?auto=compress&cs=tinysrgb&w=1920" 
            alt="FreeSun Balloon Crew" 
            className="w-full h-full object-cover brightness-50 dark:brightness-[0.3]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-8xl font-bold mb-4 tracking-tight italic animate-in slide-in-from-bottom-8 duration-700">
            Rocky Mountain Fly
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Join the most exclusive community of ballooning enthusiasts. From luxury morning rides to pilot certification, we touch the sky.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
            <button 
              onClick={() => setIsSignUpModalOpen(true)}
              className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black text-lg rounded-2xl hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl shadow-primary/20"
            >
              Join the crew
            </button>
            <button 
              onClick={scrollToAbout}
              className="w-full sm:w-auto px-10 py-5 bg-white border text-primary font-black text-lg rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              Learn about us
            </button>
          </div>
        </div>
      </section>

      {/* Features / Benefits */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why FreeSun?</h2>
            <p className="text-muted-foreground text-lg">Experience ballooning the way it was meant to be.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-primary/10 dark:bg-background/60 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Safety First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our fleet is inspected daily and maintained by factory-certified mechanics. Zero accidents in 30 years.
              </p>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-primary/10 dark:bg-background/60 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Unique Locations</h3>
              <p className="text-muted-foreground leading-relaxed">
                We have exclusive permits for takeoff in national parks and scenic valleys unavailable to other clubs.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-primary/10 dark:bg-background/60 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pilot Training</h3>
              <p className="text-muted-foreground leading-relaxed">
                Want to take the burner? Our flight school takes you from enthusiast to commercial pilot license.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-24 bg-muted/20 scroll-mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-[2rem] -z-10 animate-pulse" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-[2rem] -z-10 animate-pulse delay-700" />
              <div className="rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl transform -rotate-2">
                <img 
                  src="https://assets.codepen.io/97621/img-ballooning-2408_1.jpg?width=1360&height=1814&format=webp" 
                  alt="FreeSun Team" 
                  className="w-full h-full object-cover aspect-[4/5]"
                />
              </div>
              <div className="absolute bottom-10 -right-10 bg-background border dark:border-primary/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-500 delay-500">
                <div className="text-4xl font-black text-primary mb-1 italic">30+</div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Years of Flight</div>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                <History size={14} /> Our Legacy
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Touching the Sky Since 1994</h2>
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                FreeSun began with a single envelope and a passion for the high-altitude tranquility of the Colorado Rockies. What started as a small circle of friends has grown into the region's most respected aeronautical club.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 font-bold text-lg">
                    <Compass className="text-primary" /> Our Mission
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To provide safe, unforgettable aerial experiences while fostering a elite community of licensed aeronauts.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 font-bold text-lg">
                    <Target className="text-primary" /> Professionalism
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We maintain our own private field base and maintenance hangars, ensuring every flight meets commercial safety standards.
                  </p>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="inline-flex items-center gap-3 text-primary font-black text-xl hover:translate-x-2 transition-all"
                >
                  Join our journey <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="pt-8 pb-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-4">Aerial Perspectives</h2>
             <p className="text-muted-foreground">A glimpse into our early morning missions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-[2.5rem] h-[400px] lg:h-auto border border-border">
              <img src="https://assets.codepen.io/97621/img-ballooning-3008_1.jpg?format=avif" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h4 className="text-2xl font-bold">Dawn Chasing</h4>
                  <p className="opacity-80">Littleton, CO</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-[2.5rem] h-[300px] border border-border">
              <img src="https://assets.codepen.io/97621/img-ballooning-1763.jpg?width=2419&height=1814&format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
            <div className="relative group overflow-hidden rounded-[2.5rem] h-[300px] border border-border">
              <img src="https://assets.codepen.io/97621/img-ballooning-3199_1.jpg?format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
            <div className="lg:col-span-2 relative group overflow-hidden rounded-[2.5rem] h-[300px] border border-border">
              <img src="https://assets.codepen.io/97621/img-ballooning-2860_1.jpg?width=1965&height=2620&format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="bg-gradient-to-r from-cyan-800 to-indigo-950 px-4 py-24">
        <div className="container mx-auto">
          <div className="text-primary-foreground relative overflow-hidden text-center bg-white/5 backdrop-blur-sm p-12 md:p-24 rounded-[3.5rem] border border-white/10">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Wind size={300} />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to fly?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
              Slots fill up months in advance. Join the waiting list or book your private morning today to experience the absolute silence of the sky.
            </p>
            <button className="px-16 py-6 bg-white text-primary font-black text-2xl rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-3 mx-auto shadow-2xl hover:scale-105 active:scale-95">
              Inquire Now <ArrowRight size={28} />
            </button>
          </div>
        </div>
      </section>

      {/* Join the Crew Modal */}
      {isSignUpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsSignUpModalOpen(false)} />
          <div className="relative bg-card border dark:border-primary/30 shadow-2xl rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 scrollbar-hide">
            <div className="p-10">
              <button 
                onClick={() => setIsSignUpModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"
              >
                <X size={24} />
              </button>

              {signUpSuccess ? (
                <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={56} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Application Received</h2>
                  <p className="text-muted-foreground text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                    Our safety officer will review your aeronautical history and contact you shortly for a base induction.
                  </p>
                  <button 
                    onClick={() => setIsSignUpModalOpen(false)}
                    className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="bg-primary/10 p-5 rounded-3xl text-primary mb-6">
                      <Users size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Aeronautical Application</h2>
                    <p className="text-muted-foreground">Join the elite ground and pilot community of the Rockies.</p>
                  </div>
                  <CrewSignUpForm 
                    onBack={() => setIsSignUpModalOpen(false)}
                    onSuccess={() => setSignUpSuccess(true)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
