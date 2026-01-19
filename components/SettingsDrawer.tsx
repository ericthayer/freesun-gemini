
import React from 'react';
import { 
  Settings, Bell, Shield, Info, HelpCircle, 
  ChevronRight, LogOut, Moon, Sun, Monitor
} from 'lucide-react';
import { Drawer } from './DrawerUI';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onStartTutorial 
}) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="App Settings">
      <div className="space-y-8 py-2">
        {/* Help & Support Section */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Info size={14} /> Support & Learning
          </h4>
          <div className="space-y-2">
            <button 
              onClick={() => {
                onClose();
                onStartTutorial();
              }}
              className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <HelpCircle size={18} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Dashboard Tutorial</div>
                  <p className="text-[10px] text-muted-foreground">Re-run the guided walkthrough</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Shield size={18} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Safety Handbook</div>
                  <p className="text-[10px] text-muted-foreground">Club standard operating procedures</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Bell size={14} /> Critical Notifications
          </h4>
          <div className="space-y-3 px-1">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="font-bold text-sm block">Instant Weather Alerts</span>
                <span className="text-[10px] text-muted-foreground">Push notifications for wind shifts</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded-lg" />
            </label>
            <div className="h-px bg-border/50" />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-sm block">Shift Reminders</span>
                <span className="text-[10px] text-muted-foreground">Alert 2 hours before deployment</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded-lg" />
            </label>
          </div>
        </section>

        {/* Display Section */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Monitor size={14} /> Account
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-destructive/5 hover:bg-destructive/10 rounded-2xl border border-transparent hover:border-destructive/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                  <LogOut size={18} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-destructive">Secure Sign Out</div>
                  <p className="text-[10px] text-destructive/70">Clear session from this device</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
            FreeSun Aeronautical Hub • v2.4.8
          </p>
        </div>
      </div>
    </Drawer>
  );
};
