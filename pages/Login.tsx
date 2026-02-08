
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Mail, Lock, ArrowRight, ShieldCheck, X, Sparkles, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { CrewSignUpForm } from '../components/CrewSignUpForm';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, userRole, session } = useAuth();
  const [view, setView] = useState<'login' | 'signup' | 'success' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (session && userRole) {
      navigate(userRole === 'pilot' ? '/dashboard' : '/crew-dashboard', { replace: true });
    }
  }, [session, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: `${window.location.origin}${window.location.pathname}#/profile-settings`,
    });

    if (resetError) {
      setRecoveryError('Unable to send recovery email. Please check the address and try again.');
    } else {
      setRecoverySent(true);
    }
    setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-24 opacity-5 text-primary pointer-events-none -rotate-12">
        <Wind size={400} />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-5 text-primary pointer-events-none rotate-12">
        <Wind size={300} />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative">
        <div className="bg-background border dark:border-primary/30 shadow-2xl rounded-[3rem] p-10 relative z-10 overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full text-muted-foreground transition-all active:scale-90"
            aria-label="Close portal"
          >
            <X size={24} />
          </button>

          {view === 'login' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-primary p-4 rounded-3xl text-white mb-6 shadow-xl shadow-primary/20">
                  <Wind size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Crew Portal</h1>
                <p className="text-muted-foreground">Sign in with your FreeSun credentials to access your dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@freesun.net"
                    autoComplete="email"
                    className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                    <Lock size={12} /> Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3.5 pr-12 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setView('recovery'); setError(null); }}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot username or password?
                </button>
              </div>

              <div className="mt-3 text-center pt-4">
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
              onBack={() => setView('login')}
              onSuccess={() => setView('success')}
            />
          )}

          {view === 'recovery' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-primary p-4 rounded-3xl text-white mb-6 shadow-xl shadow-primary/20">
                  <Lock size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Account Recovery</h1>
                <p className="text-muted-foreground">
                  Enter the email address associated with your FreeSun account. We'll send you a link to reset your password.
                </p>
              </div>

              {recoverySent ? (
                <div className="text-center py-4 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Recovery Email Sent</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    If an account exists for <span className="font-bold text-foreground">{recoveryEmail}</span>, you will receive an email with instructions to reset your password.
                  </p>
                  <p className="text-muted-foreground text-xs mb-8">
                    Don't see it? Check your spam folder, or contact the Flight Operations Coordinator for help with your username.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setRecoverySent(false); setRecoveryEmail(''); }}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Back to Sign In <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecovery} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="recovery-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="you@freesun.net"
                      autoComplete="email"
                      className="w-full bg-muted/50 border dark:border-primary/30 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {recoveryError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <AlertCircle size={16} className="shrink-0" />
                      {recoveryError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {recoveryLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>Send Recovery Link</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setView('login'); setRecoveryError(null); setRecoveryEmail(''); }}
                    className="w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
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

          <div className="mt-10 pt-6 border-t dark:border-primary/30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
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
