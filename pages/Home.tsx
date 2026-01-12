
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Shield, Wind, Sparkles } from 'lucide-react';

interface HomeProps {
  isLoggedIn: boolean;
}

const Home: React.FC<HomeProps> = ({ isLoggedIn }) => {
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
          <h1 className="text-5xl md:text-8xl font-bold mb-4 tracking-tight italic">
            Rocky Mountain Fly
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-slate-300">
            Join the most exclusive community of ballooning enthusiasts. From luxury morning rides to pilot certification, we touch the sky.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-105">
              Join the crew
            </button>
            <Link 
              to={isLoggedIn ? "/dashboard" : "/"} 
              className="w-full sm:w-auto px-8 py-4 bg-white border text-primary font-bold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105"
            >
              Learn about us
            </Link>
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
            <div className="p-8 rounded-3xl bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary/10 dark:bg-background/60 rounded-xl flex items-center justify-center text-primary mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Safety First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our fleet is inspected daily and maintained by factory-certified mechanics. Zero accidents in 30 years.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary/10 dark:bg-background/60 rounded-xl flex items-center justify-center text-primary mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Unique Locations</h3>
              <p className="text-muted-foreground leading-relaxed">
                We have exclusive permits for takeoff in national parks and scenic valleys unavailable to other clubs.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-muted/50 border dark:border-primary/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary/10 dark:bg-background/60 rounded-xl flex items-center justify-center text-primary mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pilot Training</h3>
              <p className="text-muted-foreground leading-relaxed">
                Want to take the burner? Our flight school takes you from enthusiast to commercial pilot license.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-3xl h-[400px] lg:h-auto">
              <img src="https://assets.codepen.io/97621/img-ballooning-3008_1.jpg?format=avif" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h4 className="text-2xl font-bold">Dawn Chasing</h4>
                  <p className="opacity-80">Littleton, CO</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl h-[300px]">
              <img src="https://assets.codepen.io/97621/img-ballooning-1763.jpg?width=2419&height=1814&format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
            <div className="relative group overflow-hidden rounded-3xl h-[300px]">
              <img src="https://assets.codepen.io/97621/img-ballooning-3199_1.jpg?format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
            <div className="lg:col-span-2 relative group overflow-hidden rounded-3xl h-[300px]">
              <img src="https://assets.codepen.io/97621/img-ballooning-2860_1.jpg?width=1965&height=2620&format=webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ballooning" />
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="bg-gradient-to-r bg-gradient-to-r from-cyan-700 to-indigo-800 px-12 py-20">
        <div className="container w-full px-4">
          <div className="text-primary-foreground relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wind size={200} />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to fly?</h2>
            <p className="text-lg mb-10 max-w-xl mx-auto opacity-90">
              Slots fill up months in advance. Join the waiting list or book your private morning today.
            </p>
            <button className="px-12 py-5 bg-white text-primary font-black text-xl rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 mx-auto">
              Inquire Now <ArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
