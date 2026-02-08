
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Wind,
  LogOut, CalendarDays
} from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import CrewDashboard from './pages/CrewDashboard';
import SafetyRecords from './pages/SafetyRecords';
import Fleet from './pages/Fleet';
import BecomePilot from './pages/BecomePilot';
import Events from './pages/Events';
import Inquiry from './pages/Inquiry';
import UserPortal from './pages/UserPortal';
import ProfileSettings from './pages/ProfileSettings';
import { useTheme } from './hooks/useTheme';
import { AdminMenu } from './components/AdminMenu';
import { SettingsDrawer } from './components/SettingsDrawer';
import { AuthProvider, useAuth } from './lib/AuthContext';

const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { session, crewProfile, userRole, signOut, loading } = useAuth();

  const isLoggedIn = !!session && !!crewProfile;

  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme}`}>
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onStartTutorial={() => {}}
      />

      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-b border-primary/50">
        <div className="container max-w-[1400] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Wind size={20} />
            </span>
            <span>FreeSun <span className="text-primary">Ballooning</span></span>
          </Link>

          <nav className="hidden md:flex md:ml-auto items-center gap-6">
            <Link to="/schedule" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
              <CalendarDays size={16} /> Schedule
            </Link>

            {isLoggedIn && userRole ? (
              <div className="flex items-center gap-4">
                <AdminMenu
                  userRole={userRole}
                  crewProfile={crewProfile}
                  theme={theme}
                  toggleTheme={toggleTheme}
                  onLogout={handleLogout}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
                  Crew Login
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 md:ml-6 md:hidden">
            <button
              className="p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background md:hidden animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col p-6 gap-6">
            <Link to="/schedule" className="text-2xl font-bold border-b pb-4 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <CalendarDays size={24} /> Schedule
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to={userRole === 'pilot' ? '/dashboard' : '/crew-dashboard'}
                  className="text-2xl font-bold border-b pb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {userRole === 'pilot' ? 'Pilot Dashboard' : 'Crew Dashboard'}
                </Link>
                <Link
                  to="/portal"
                  className="text-2xl font-bold text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Portal
                </Link>
                <Link
                  to="/profile-settings"
                  className="text-2xl font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-2xl font-bold text-left"
                >
                  App Settings
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 text-destructive font-semibold mt-auto text-xl"
                >
                  <LogOut size={24} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-2xl font-bold text-primary" onClick={() => setIsMenuOpen(false)}>
                Crew Login
              </Link>
            )}
          </nav>
        </div>
      )}

      <main className="flex flex-col flex-grow">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={isLoggedIn && userRole === 'pilot' ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/crew-dashboard" element={isLoggedIn && userRole === 'crew' ? <CrewDashboard /> : <Navigate to="/login" />} />
          <Route path="/portal" element={isLoggedIn ? <UserPortal userRole={userRole || 'crew'} /> : <Navigate to="/login" />} />
          <Route path="/profile-settings" element={isLoggedIn ? <ProfileSettings /> : <Navigate to="/login" />} />
          <Route path="/schedule" element={<Schedule isLoggedIn={isLoggedIn} />} />
          <Route path="/safety" element={<SafetyRecords />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/become-a-pilot" element={<BecomePilot />} />
          <Route path="/events" element={<Events />} />
          <Route path="/inquire" element={<Inquiry />} />
        </Routes>
      </main>

      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold mb-4">FreeSun Ballooning</h3>
              <p className="text-muted-foreground max-w-sm">
                The premier hot air ballooning club for pilots and enthusiasts.
                Chasing sunrises and making memories since 1994.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Club</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/safety" className="hover:text-primary transition-colors">Safety Records</Link></li>
                <li><Link to="/fleet" className="hover:text-primary transition-colors">Fleet & Crew</Link></li>
                <li><Link to="/become-a-pilot" className="hover:text-primary transition-colors">Become a Pilot</Link></li>
                <li><Link to="/events" className="hover:text-primary transition-colors">Member Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Vimeo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t dark:border-primary/30 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FreeSun Ballooning Club. All rights reserved.
            Designed for high performance in remote locations.
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
