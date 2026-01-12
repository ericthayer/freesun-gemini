
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Plane, Users, ArrowRight, ShieldCheck, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { LoginRoleButton } from '../components/LoginRoleButton';
import { CrewSignUpForm } from '../components/CrewSignUpForm';

interface LoginProps {
  onLogin: (role: 'pilot' | 'crew') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'selection' | 'signup' | 'success'>('selection');

  const handleRoleSelection = (role: 'pilot' | 'crew') => {
    onLogin(role);
    if (role === 'pilot') {
      navigate('/dashboard');
    } else {
      navigate('/crew-dashboard');
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-24 opacity-5 text-primary pointer-events-none -rotate-12">
        <Wind size={400} />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-5 text-primary pointer-events-none rotate-12">
        <Wind size={300} />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative">
        <div className="bg-background border shadow-2xl rounded-[3rem] p-10 relative z-10 overflow-hidden">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full text-muted-foreground transition-all active:scale-90"
            aria-label="Close portal"
          >
            <X size={24} />
          </button>

          {view === 'selection' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-primary p-4 rounded-3xl text-white mb-6 shadow-xl shadow-primary/20">
                  <Wind size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Crew Portal</h1>
                <p className="text-muted-foreground">Authorized FreeSun personnel only. Please select your operational role to continue.</p>
              </div>

              <div className="space-y-4">
                <LoginRoleButton 
                  onClick={() => handleRoleSelection('pilot')}
                  icon={Plane}
                  title="Pilot Login"
                  description="Flight briefings & logs"
                />

                <LoginRoleButton 
                  onClick={() => handleRoleSelection('crew')}
                  icon={Users}
                  title="Crew Login"
                  description="Profile & assigned shifts"
                />
              </div>

              <div className="mt-8 text-center border-t border-border/50 pt-8">
                <button 
                  onClick={() => setView('signup')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-all group"
                >
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                  Apply to join the FreeSun crew
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {view === 'signup' && (
            <CrewSignUpForm 
              onBack={() => setView('selection')}
              onSuccess={() => setView('success')}
            />
          )}

          {view === 'success' && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Application Sent!</h2>
              <p className="text-muted-foreground mb-8">
                Our operations team will review your profile and contact you within 48 hours for a safety screening.
              </p>
              <button 
                onClick={handleClose}
                className="w-full py-4 bg-muted hover:bg-muted/80 font-bold rounded-2xl transition-all"
              >
                Return to Homepage
              </button>
            </div>
          )}

          <div className="mt-10 pt-6 border-t flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <ShieldCheck size={14} />
            Secure Aeronautical Access
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Trouble logging in? Contact the <a href="#" className="underline font-bold hover:text-primary transition-colors">Flight Operations Coordinator</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
