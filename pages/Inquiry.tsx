
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Calendar, Users, 
  Sparkles, Mail, User, Phone, 
  MessageSquare, CheckCircle2, Wind,
  ChevronRight
} from 'lucide-react';

const Inquiry: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 bg-muted/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-5 text-primary pointer-events-none -rotate-12">
          <Wind size={400} />
        </div>
        <div className="max-w-2xl w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={56} className="animate-in fade-in zoom-in duration-700" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight italic">Mission Confirmed</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic max-w-lg mx-auto">
              Your inquiry has been logged into our flight queue. Our Guest Relations team will reach out within 24 hours to finalize your sunrise window.
            </p>
          </div>
          <div className="pt-8">
            <button 
              onClick={() => navigate('/')}
              className="px-12 py-5 bg-primary text-white font-black text-xl rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative">
      {/* Visual Side */}
      <div className="lg:w-2/5 relative h-[300px] lg:h-auto overflow-hidden">
        <img 
          src="https://assets.codepen.io/97621/img-ballooning-3199_1.jpg?format=webp" 
          alt="Sunrise Flight" 
          className="absolute inset-0 w-full h-full object-cover brightness-75 lg:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background lg:from-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-8 left-8 right-8 text-white z-10 lg:hidden">
          <h1 className="text-4xl font-bold tracking-tight italic">Your Sunrise Awaits</h1>
        </div>
      </div>

      {/* Form Side */}
      <div className="lg:w-3/5 p-6 md:p-12 lg:p-24 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full space-y-12 animate-in slide-in-from-right-8 duration-700">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group mb-8"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to experience
            </button>
            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={14} /> VIP Booking Inquiry
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 italic">
                Touch the <span className="text-primary">Sky</span>
              </h1>
              <p className="text-lg text-muted-foreground italic leading-relaxed">
                Fill out the manifest details below. Our concierge will curate a private morning experience tailored to your party.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                  <User size={12} className="text-primary" /> Full Name
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Jean-Pierre Blanchard"
                  className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                  <Mail size={12} className="text-primary" /> Email
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="pilot@freesun.net"
                  className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                  <Calendar size={12} className="text-primary" /> Preferred Window
                </label>
                <input 
                  type="date" 
                  required 
                  className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium cursor-pointer" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                  <Users size={12} className="text-primary" /> Party Size
                </label>
                <select className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium cursor-pointer appearance-none">
                  <option>Private (2 People)</option>
                  <option>Small Group (3-5 People)</option>
                  <option>Standard Group (6-8 People)</option>
                  <option>Corporate Gala (8+ People)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                <MessageSquare size={12} className="text-primary" /> Special Occasion or Requests
              </label>
              <textarea 
                placeholder="Anniversary, proposal, birthday surprise, or specific dietary needs for the post-flight champagne breakfast..."
                className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium min-h-[120px] resize-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-primary text-white font-black text-2xl rounded-[2rem] shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    Initiate Booking <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-6 opacity-60">
                Authorized Flight Operation Request • Chatfield Field Base
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
