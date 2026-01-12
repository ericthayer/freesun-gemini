
import React, { useState, useMemo } from 'react';
import { 
  User, Calendar, Plane, Award, MapPin, Mail, Phone, 
  Settings, LogOut, CheckCircle2, Circle, Clock, ChevronRight,
  Briefcase, X, ArrowRight, AlertCircle, Users
} from 'lucide-react';
import { CrewMember } from '../components/CrewUI';
import { CrewProfileForm } from '../components/CrewProfileForm';
import { ScheduleItem, ScheduleCard } from '../components/ScheduleUI';

const CrewDashboard: React.FC = () => {
  // Simulating the "logged-in" crew member
  const [me, setMe] = useState<CrewMember>({
    id: '4',
    name: 'Elena Rodriguez',
    role: 'Ground Crew',
    experience: 3,
    contact: { email: 'elena@freesun.net', phone: '+1 555-0104' },
    certifications: ['Recovery Specialist', 'Radio Communications', 'FAA Ground Handling'],
    bio: 'Expert navigator and recovery lead. Never lost a balloon, even in the dense morning fog of the valley.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    availability: 'available'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'schedule'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showShiftMarketplace, setShowShiftMarketplace] = useState(false);

  // My Assignments
  const [myAssignments, setMyAssignments] = useState<ScheduleItem[]>([
    {
      id: 's1',
      type: 'flight',
      title: 'Valley Mist Morning Ride',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '06:15',
      location: 'South Ridge Launch Site',
      description: 'Standard tourist flight for 4 passengers. Ground crew arrival at 05:30 for cold inflation.',
      attendees: 4
    }
  ]);

  // Marketplace Shits
  const [marketplaceShifts, setMarketplaceShifts] = useState<ScheduleItem[]>([
    {
      id: 'm1',
      type: 'flight',
      title: 'Sonoma Vineyard Tour',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '05:45',
      location: 'Main Sonoma Base',
      description: 'Luxury tour for a corporate group. Needs 2 recovery vehicles.',
      requiresCrew: true
    },
    {
      id: 'm2',
      type: 'training',
      title: 'Ground Handling Workshop',
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      time: '14:00',
      location: 'South Field',
      description: 'Assistant instructors needed for new member orientation.',
      requiresCrew: true
    }
  ]);

  const handleUpdateProfile = (updated: CrewMember) => {
    setMe(updated);
    setIsEditing(false);
    setActiveTab('overview');
  };

  const claimShift = (id: string) => {
    const shift = marketplaceShifts.find(s => s.id === id);
    if (shift) {
      setMyAssignments(prev => [...prev, { ...shift, requiresCrew: false }]);
      setMarketplaceShifts(prev => prev.filter(s => s.id !== id));
      setShowShiftMarketplace(false);
      setActiveTab('schedule');
    }
  };

  const isAvailable = me.availability === 'available';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl grow animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Profile Card */}
        <div className="lg:w-1/3 shrink-0">
          <div className="bg-background border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden sticky top-24">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-muted/50 mb-4 shadow-inner">
                <img src={me.imageUrl} alt={me.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{me.name}</h1>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-1">
                  <Users size={10} /> Crew
                </span>
              </div>
              
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
                {me.role}
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mb-8">
                <div className="bg-muted/50 p-3 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Experience</div>
                  <div className="font-bold">{me.experience} Yrs</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Flights</div>
                  <div className="font-bold">142</div>
                </div>
              </div>

              <button
                onClick={() => setMe(prev => ({ ...prev, availability: isAvailable ? 'busy' : 'available' }))}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all border ${
                  isAvailable 
                    ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {isAvailable ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                {isAvailable ? 'Available for Launch' : 'Set Available'}
              </button>
            </div>

            <div className="mt-8 space-y-4 pt-8 border-t">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary/50" />
                <span className="truncate">{me.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary/50" />
                <span>{me.contact.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow space-y-6">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
            {(['overview', 'profile', 'schedule'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== 'profile') setIsEditing(false);
                  if (tab === 'profile') setIsEditing(true);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab === 'overview' && <Plane size={14} />}
                {tab === 'profile' && <User size={14} />}
                {tab === 'schedule' && <Calendar size={14} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-muted/10 rounded-[2.5rem] min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-8 p-6">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Clock className="text-primary" /> Active Assignments
                    </h3>
                    <button 
                      onClick={() => setShowShiftMarketplace(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Browse All Shifts <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {myAssignments.length > 0 ? (
                      myAssignments.slice(0, 2).map(item => (
                        <div key={item.id} className="bg-background border rounded-[2rem] p-6 hover:shadow-lg transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{item.type}</span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                          </div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock size={14} /> {item.time}</div>
                            <div className="flex items-center gap-1"><MapPin size={14} /> {item.location}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-background border rounded-[2rem] p-10 text-center border-dashed">
                        <p className="text-muted-foreground text-sm italic">No flights currently assigned.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-primary" /> My Certifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {me.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-background border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <span className="font-bold text-sm">{cert}</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'profile' && isEditing && (
              <div className="p-4">
                <CrewProfileForm 
                  member={me} 
                  onUpdate={handleUpdateProfile} 
                  onCancel={() => {
                    setIsEditing(false);
                    setActiveTab('overview');
                  }}
                  title="My Personal Profile"
                />
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="text-primary" /> Flight Duty Calendar
                    </h3>
                    <div className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                      {myAssignments.length} Shifts Booked
                    </div>
                 </div>
                <div className="space-y-4">
                  {myAssignments.map(item => (
                    <ScheduleCard key={item.id} item={item} />
                  ))}
                  
                  {marketplaceShifts.length > 0 && (
                    <div className="bg-primary/5 border border-dashed border-primary/20 rounded-[2rem] p-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-primary mb-2">
                        <AlertCircle size={20} />
                        <span className="font-bold">Open Shifts Available</span>
                      </div>
                      <p className="text-muted-foreground italic text-sm mb-6">There are {marketplaceShifts.length} flights needing crew members this week.</p>
                      <button 
                        onClick={() => setShowShiftMarketplace(true)}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 mx-auto shadow-lg shadow-primary/20"
                      >
                        Claim Open Shifts <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Marketplace Modal */}
      {showShiftMarketplace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowShiftMarketplace(false)} />
          <div className="relative bg-card border shadow-2xl rounded-[3rem] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Shift Marketplace</h3>
                <p className="text-sm text-muted-foreground">Claim available flight assignments and support your team.</p>
              </div>
              <button 
                onClick={() => setShowShiftMarketplace(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {marketplaceShifts.length > 0 ? (
                marketplaceShifts.map(item => (
                  <ScheduleCard 
                    key={item.id} 
                    item={item} 
                    onClaim={claimShift}
                  />
                ))
              ) : (
                <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
                  <CheckCircle2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-bold text-muted-foreground">All shifts are covered!</h3>
                  <p className="text-sm text-muted-foreground/60">Check back later for new mission openings.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-muted/30 border-t flex justify-end">
              <button 
                onClick={() => setShowShiftMarketplace(false)}
                className="px-6 py-2.5 bg-background border text-sm font-bold rounded-xl"
              >
                Close Marketplace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewDashboard;
