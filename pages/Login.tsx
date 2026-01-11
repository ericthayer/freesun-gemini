
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Plane, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'pilot' | 'crew') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'pilot' | 'crew') => {
    onLogin(role);
    if (role === 'pilot') {
      navigate('/dashboard');
    } else {
      navigate('/crew-dashboard');
    }
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

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-background border shadow-2xl rounded-[3rem] p-10 relative z-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-primary p-4 rounded-3xl text-white mb-6 shadow-xl shadow-primary/20">
              <Wind size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Crew Portal</h1>
            <p className="text-muted-foreground">Authorized FreeSun personnel only. Please select your operational role to continue.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelection('pilot')}
              className="w-full group bg-muted/50 hover:bg-primary/10 border-2 border-transparent hover:border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plane size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Pilot Login</h3>
                <p className="text-xs text-muted-foreground">Flight briefings & logs</p>
              </div>
              <ArrowRight className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" size={20} />
            </button>

            <button
              onClick={() => handleRoleSelection('crew')}
              className="w-full group bg-muted/50 hover:bg-primary/10 border-2 border-transparent hover:border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Crew Login</h3>
                <p className="text-xs text-muted-foreground">Profile & assigned shifts</p>
              </div>
              <ArrowRight className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" size={20} />
            </button>
          </div>

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
