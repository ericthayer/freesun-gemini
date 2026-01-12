
import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { ScheduleItem, ScheduleCard, ScheduleForm } from '../components/ScheduleUI';
import { ConfirmationModal } from '../components/CommonUI';

interface SchedulePageProps {
  isLoggedIn: boolean;
}

const Schedule: React.FC<SchedulePageProps> = ({ isLoggedIn }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: 's1',
      type: 'flight',
      title: 'Valley Mist Morning Ride',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '06:15',
      location: 'South Ridge Launch Site',
      description: 'Standard tourist flight for 4 passengers. Ground crew arrival at 05:30 for cold inflation.',
      attendees: 4
    },
    {
      id: 's2',
      type: 'training',
      title: 'Emergency Landing Drills',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '09:00',
      location: 'West Field',
      description: 'Mandatory session for all junior pilots. Focus on high-wind approach techniques.',
      attendees: 12
    },
    {
      id: 's3',
      type: 'meeting',
      title: 'Annual Safety Review',
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      time: '18:30',
      location: 'Main Clubhouse',
      description: 'Discussion of new FAA regulations and internal club maintenance logs for the winter season.',
    }
  ]);

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const sortedSchedule = useMemo(() => {
    return [...scheduleItems].sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [scheduleItems]);

  const handleEventSubmit = (data: Partial<ScheduleItem>) => {
    if (editingEvent) {
      setScheduleItems(prev => prev.map(item => item.id === editingEvent.id ? { ...item, ...data } as ScheduleItem : item));
      setEditingEvent(null);
    } else {
      const newItem: ScheduleItem = {
        ...data as ScheduleItem,
        id: Math.random().toString(36).substr(2, 9),
      };
      setScheduleItems(prev => [...prev, newItem]);
      setIsAddingEvent(false);
    }
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setScheduleItems(prev => prev.filter(item => item.id !== eventToDelete));
      setEventToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl grow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Club Schedule</h1>
          <p className="text-muted-foreground">Stay updated with our planned flights, training, and social gatherings.</p>
        </div>
        
        {isLoggedIn && (
          <button 
            onClick={() => {
              setEditingEvent(null);
              setIsAddingEvent(!isAddingEvent);
            }} 
            className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            {isAddingEvent ? <X size={16} /> : <Plus size={16} />}
            {isAddingEvent ? 'Cancel' : 'Add New Event'}
          </button>
        )}
      </div>

      {(isAddingEvent || editingEvent) && isLoggedIn && (
        <div className="bg-muted/30 border dark:border-primary/30 rounded-[2rem] p-8 mb-12 animate-in zoom-in-95 duration-200 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {editingEvent ? <Edit2Icon /> : <Plus className="text-primary" />}
              {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Create New Event'}
            </h3>
            <button 
              onClick={() => {
                setIsAddingEvent(false);
                setEditingEvent(null);
              }}
              className="p-2 hover:bg-muted rounded-full"
            >
              <X size={18} />
            </button>
          </div>
          <ScheduleForm 
            initialData={editingEvent || undefined}
            isEditing={!!editingEvent}
            onSubmit={handleEventSubmit}
            onCancel={() => {
              setIsAddingEvent(false);
              setEditingEvent(null);
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        {sortedSchedule.length > 0 ? (
          sortedSchedule.map(item => (
            <ScheduleCard 
              key={item.id} 
              item={item} 
              onEdit={isLoggedIn ? setEditingEvent : undefined}
              onDelete={isLoggedIn ? setEventToDelete : undefined}
            />
          ))
        ) : (
          <div className="py-32 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
            <CalendarDays size={64} className="mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-2xl font-bold text-muted-foreground">The sky is clear for now</h3>
            <p className="text-muted-foreground/60 max-w-sm mx-auto mt-2">No upcoming events are currently scheduled. Check back soon for new flight windows.</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={eventToDelete !== null}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Schedule Item"
        message="Are you sure you want to remove this event from the schedule? This action cannot be undone."
        confirmText="Delete Event"
        variant="danger"
      />
    </div>
  );
};

const Edit2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);

export default Schedule;
