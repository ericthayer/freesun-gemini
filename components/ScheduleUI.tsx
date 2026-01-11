
import React from 'react';
import { 
  Calendar, Clock, MapPin, Plane, Users, GraduationCap, 
  MessageSquare, Edit2, Trash2, Tag, Info
} from 'lucide-react';

export type ScheduleItemType = 'flight' | 'training' | 'social' | 'meeting';

export interface ScheduleItem {
  id: string;
  type: ScheduleItemType;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees?: number;
}

const typeConfig = {
  flight: { icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Planned Flight' },
  training: { icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Training Session' },
  social: { icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Club Social' },
  meeting: { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Safety Meeting' },
};

interface ScheduleCardProps {
  item: ScheduleItem;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, onEdit, onDelete }) => {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="bg-background border rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all duration-300 group relative">
      <div className={`w-16 h-16 shrink-0 rounded-2xl ${config.bg} flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      
      <div className="flex-grow space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                {config.label}
              </span>
              {item.attendees && (
                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {item.attendees} Registered
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">{item.title}</h3>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button 
                  onClick={() => onEdit(item)}
                  className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Edit Event"
                >
                  <Edit2 size={16} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Calendar size={14} className="text-primary/50" />
            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock size={14} className="text-primary/50" />
            {item.time}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium sm:col-span-2">
            <MapPin size={14} className="text-primary/50" />
            {item.location}
          </div>
        </div>

        <div className="pt-2 border-t border-border/10">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ScheduleFormProps {
  initialData?: Partial<ScheduleItem>;
  onSubmit: (data: Partial<ScheduleItem>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = React.useState<Partial<ScheduleItem>>(
    initialData || {
      type: 'flight',
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '06:00',
      location: '',
      description: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Tag size={12} /> Event Type
          </label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduleItemType })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          >
            <option value="flight">Planned Flight</option>
            <option value="training">Training Session</option>
            <option value="social">Club Social</option>
            <option value="meeting">Safety Meeting</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Info size={12} /> Event Title
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g. Sunrise Run Over Valley"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Calendar size={12} /> Date
          </label>
          <input 
            type="date" 
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Clock size={12} /> Time
          </label>
          <input 
            type="time" 
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <MapPin size={12} /> Location
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g. Field Base Alpha"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
          <MessageSquare size={12} /> Description
        </label>
        <textarea 
          placeholder="Detailed agenda, specific pilot requirements, or meeting points..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          {isEditing ? 'Update Schedule Item' : 'Add to Schedule'}
        </button>
      </div>
    </form>
  );
};
