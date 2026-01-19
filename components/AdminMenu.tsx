
import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Moon, Sun, LogOut, ChevronDown, 
  LayoutDashboard 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminMenuProps {
  userRole: 'pilot' | 'crew';
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ 
  userRole, theme, toggleTheme, onLogout, onOpenSettings 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mocked data for the prototype
  const name = userRole === 'pilot' ? 'Sarah Miller' : 'Elena Rodriguez';
  const initials = userRole === 'pilot' ? 'SM' : 'ER';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 hover:bg-muted rounded-full transition-all border border-transparent hover:border-primary/20 group"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border dark:border-primary/30 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="p-4 bg-muted/30 border-b dark:border-primary/30">
            <div className="font-bold text-sm text-foreground">{name}</div>
            <div className="text-[10px] font-black uppercase text-primary tracking-widest">{userRole} Account</div>
          </div>
          
          <div className="p-2 space-y-1">
            <Link 
              to={userRole === 'pilot' ? '/dashboard' : '/crew-dashboard'}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group/item"
            >
              <LayoutDashboard size={16} className="text-muted-foreground group-hover/item:text-primary" /> 
              My Portal
            </Link>

            <button 
              onClick={() => { onOpenSettings(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group/item text-left"
            >
              <Settings size={16} className="text-muted-foreground group-hover/item:text-primary" /> 
              App Settings
            </button>

            <button 
              onClick={() => { toggleTheme(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group/item text-left"
            >
              {theme === 'dark' ? <Sun size={16} className="text-muted-foreground group-hover/item:text-primary" /> : <Moon size={16} className="text-muted-foreground group-hover/item:text-primary" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <div className="p-2 border-t dark:border-primary/30">
            <button 
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors group/item text-left"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
