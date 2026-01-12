
import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, Phone, Mail, User, ShieldCheck, Plane, Users, ChevronRight, Send, X } from 'lucide-react';
import { CrewMember } from './CrewUI';
import { calculateCrewRelevance } from '../utils/searchUtils';

interface CrewConnectProps {
  members: CrewMember[];
}

export const CrewConnect: React.FC<CrewConnectProps> = ({ members }) => {
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState<CrewMember | null>(null);
  const [messageText, setMessageText] = useState('');

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members.slice(0, 4); // Show first few by default
    
    return members
      .filter(m => calculateCrewRelevance(m, search) > -10)
      .sort((a, b) => calculateCrewRelevance(b, search) - calculateCrewRelevance(a, search));
  }, [members, search]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    // Simulate sending
    alert(`Message sent to ${activeChat?.name}: ${messageText}`);
    setMessageText('');
    setActiveChat(null);
  };

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
            <Users className="text-primary" /> Crew Connect
          </h3>
          <p className="text-sm text-muted-foreground">Search and coordinate with pilots and ground crew in real-time.</p>
        </div>
        
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Search name, role, or certification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-primary/20 rounded-[1.5rem] text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMembers.map(member => (
          <div 
            key={member.id} 
            className="bg-muted/30 border border-primary/20 rounded-[2rem] p-5 hover:bg-muted/50 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0">
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{member.name}</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  {member.role === 'Pilot' ? <Plane size={10} className="text-primary" /> : <Users size={10} className="text-primary" />}
                  {member.role}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
               <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                member.availability === 'available' 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${member.availability === 'available' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                {member.availability === 'available' ? 'Active' : 'Off-Duty'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveChat(member)}
                className="flex-grow py-2.5 bg-background border border-primary/10 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Message
              </button>
              <a 
                href={`tel:${member.contact.phone}`}
                className="p-2.5 bg-background border border-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all"
              >
                <Phone size={14} />
              </a>
            </div>
          </div>
        ))}
        
        {filteredMembers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10">
            <Search size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground italic">No matching crew found</p>
          </div>
        )}
      </div>

      {/* Simplified Chat Overlay */}
      {activeChat && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setActiveChat(null)} />
          <div className="relative bg-card border shadow-2xl rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 bg-muted/50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/20">
                  <img src={activeChat.imageUrl} alt={activeChat.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">{activeChat.name}</h4>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">{activeChat.role}</p>
                </div>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 h-[200px] bg-background/50 flex flex-col justify-end">
              <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest mb-4">Starting Secure Transmission</p>
              <div className="bg-muted p-3 rounded-2xl rounded-bl-none text-sm max-w-[80%] self-start border">
                Establishing radio-link with {activeChat.role} station...
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-muted/30 border-t flex gap-2">
              <input 
                autoFocus
                type="text" 
                placeholder="Type your transmission..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-grow bg-background border border-primary/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button 
                type="submit"
                className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
