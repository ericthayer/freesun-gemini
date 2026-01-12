
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  Menu, X, Sun, Moon, Wind, 
  LogOut, CalendarDays, User 
} from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import CrewDashboard from './pages/CrewDashboard';
import { useTheme } from './hooks/useTheme';

type UserRole = 'pilot' | 'crew' | null;

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogin = (role: 'pilot' | 'crew') => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col ${theme}`}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-b-slate-700">
          <div className="container max-w-[1400] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <span className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                <Wind size={20} />
              </span>
              <span>FreeSun <span className="text-primary">Ballooning</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex md:ml-auto items-center gap-6">
              <Link to="/schedule" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <CalendarDays size={16} /> Schedule
              </Link>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link 
                    to={userRole === 'pilot' ? '/dashboard' : '/crew-dashboard'} 
                    className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-all flex items-center gap-2"
                  >
                    <User size={14} />
                    {userRole === 'pilot' ? 'Pilot Portal' : 'Crew Portal'}
                  </Link>
                  <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Crew Login
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2 md:ml-6">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                className="md:hidden p-2 hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
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
                    className="text-2xl font-bold text-primary" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {userRole === 'pilot' ? 'Pilot Portal' : 'Crew Portal'}
                  </Link>
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
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/dashboard" element={isLoggedIn && userRole === 'pilot' ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/crew-dashboard" element={isLoggedIn && userRole === 'crew' ? <CrewDashboard /> : <Navigate to="/login" />} />
            <Route path="/schedule" element={<Schedule isLoggedIn={isLoggedIn} />} />
          </Routes>
        </main>

        <footer className="border-t bg-muted/30 py-12">
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
                  <li><a href="#" className="hover:text-primary transition-colors">Safety Records</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Our Fleet</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Become a Pilot</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Member Events</a></li>
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
            <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} FreeSun Ballooning Club. All rights reserved. 
              Designed for high performance in remote locations.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
