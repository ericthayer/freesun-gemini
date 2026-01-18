
import React from 'react';
import { 
  Users, Plane, Mail, Phone, Award, Search, Filter, Briefcase, GraduationCap, Edit2, CheckCircle2, Circle, Activity, RotateCcw
} from 'lucide-react';

export interface CrewMember {
  id: string;
  name: string;
  role: 'Pilot' | 'Ground Crew';
  experience: number;
  contact: {
    email: string;
    phone: string;
  };
  certifications: string[];
  bio: string;
  imageUrl?: string;
  availability: 'available' | 'busy';
}

interface CrewMemberCardProps {
  member: CrewMember;
  onEdit?: (member: CrewMember) => void;
  onToggleAvailability?: (id: string) => void;
}

export const CrewMemberCard: React.FC<CrewMemberCardProps> = ({ member, onEdit, onToggleAvailability }) => {
  const isAvailable = member.availability === 'available';

  return (
    <div className="bg-background border dark:border-primary/30 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group relative">
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-4 border-muted/50 shadow-inner group-hover:scale-105 transition-transform">
          <img 
            src={member.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
            alt={member.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="space-y-3 flex-grow">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{member.name}</h3>
                {onEdit && (
                  <button 
                    onClick={() => onEdit(member)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Edit Profile"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mt-0.5">
                {member.role === 'Pilot' ? <Plane size={12} /> : <Users size={12} />}
                {member.role}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {member.experience} Yrs Exp
              </div>
              
              {/* Availability Toggle */}
              <button
                onClick={() => onToggleAvailability?.(member.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border dark:border-primary/30 ${
                  isAvailable 
                    ? 'bg-green-500/10 border-green-500/30 text-green-600' 
                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isAvailable ? <CheckCircle2 size={10} className="animate-pulse" /> : <Circle size={10} />}
                {isAvailable ? 'Available Now' : 'Busy'}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <a href={`mailto:${member.contact.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail size={12} /> {member.contact.email}
            </a>
            <a href={`tel:${member.contact.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone size={12} /> {member.contact.phone}
            </a>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 space-y-4">
        <div className="bg-muted/30 p-4 rounded-2xl">
          <p className="text-xs leading-relaxed text-foreground/80 italic">
            "{member.bio}"
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Award size={10} /> Active Certifications
          </div>
          <div className="flex flex-wrap gap-2">
            {member.certifications.map((cert, idx) => (
              <span key={idx} className="bg-background border dark:border-primary/30 text-[9px] font-bold px-2 py-1 rounded-md text-muted-foreground">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CrewFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  expFilter: number;
  onExpFilterChange: (val: number) => void;
  certFilter: string;
  onCertFilterChange: (val: string) => void;
  availabilityFilter: string;
  onAvailabilityFilterChange: (val: string) => void;
  onClearAll: () => void;
}

export const CrewFilterBar: React.FC<CrewFilterBarProps> = ({
  search, onSearchChange,
  roleFilter, onRoleFilterChange,
  expFilter, onExpFilterChange,
  certFilter, onCertFilterChange,
  availabilityFilter, onAvailabilityFilterChange,
  onClearAll
}) => {
  return (
    <div className="flex flex-col gap-4 w-full grow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 grow">
        <div className="relative flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="Search by name, bio, or keywords (e.g. 'pilot instructor')..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/50 border dark:border-primary/30 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
      </div>
        <div className="relative flex">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <select 
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border dark:border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Pilot">Pilots</option>
            <option value="Ground Crew">Ground Crew</option>
          </select>
        </div>

        <div className="relative flex">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <select 
            value={expFilter}
            onChange={(e) => onExpFilterChange(Number(e.target.value))}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border dark:border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
          >
            <option value={0}>Any Experience</option>
            <option value={5}>5+ Years</option>
            <option value={10}>10+ Years</option>
            <option value={15}>15+ Years</option>
          </select>
        </div>

        <div className="relative flex">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <select 
            value={certFilter}
            onChange={(e) => onCertFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border dark:border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Certifications</option>
            <option value="Commercial">Commercial License</option>
            <option value="Instructor">Instructor</option>
            <option value="Safety">Safety / Response</option>
            <option value="Technician">Maintenance</option>
            <option value="Recovery">Recovery</option>
          </select>
        </div>

        <div className="relative flex">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <select 
            value={availabilityFilter}
            onChange={(e) => onAvailabilityFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border dark:border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy / Off Duty</option>
          </select>
        </div>

        <button 
          onClick={onClearAll}
          className="p-3 bg-muted/50 border dark:border-primary/30 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center shrink-0"
          title="Clear All Filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
