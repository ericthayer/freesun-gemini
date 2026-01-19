
import React, { useState } from 'react';
import { 
  Wrench, Calendar, Plus, Trash2, Edit3, CheckCircle2, 
  X, Save, FileText, Settings, History, Plane
} from 'lucide-react';

export interface MaintenanceEntry {
  id: string;
  balloonName: string;
  date: string;
  serviceType: string;
  partsUsed: string;
  notes: string;
  technician: string;
}

interface MaintenanceHubProps {
  logs: MaintenanceEntry[];
  onAdd: (log: MaintenanceEntry) => void;
  onUpdate: (log: MaintenanceEntry) => void;
  onDelete: (id: string) => void;
  balloons: string[];
}

export const MaintenanceHub: React.FC<MaintenanceHubProps> = ({ 
  logs, onAdd, onUpdate, onDelete, balloons 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<MaintenanceEntry, 'id'>>({
    balloonName: balloons[0] || 'SunChaser #04',
    date: new Date().toISOString().split('T')[0],
    serviceType: '',
    partsUsed: '',
    notes: '',
    technician: 'Sarah Miller'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAdd({ ...formData, id: Math.random().toString(36).substr(2, 9) });
    }
    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      balloonName: balloons[0] || 'SunChaser #04',
      date: new Date().toISOString().split('T')[0],
      serviceType: '',
      partsUsed: '',
      notes: '',
      technician: 'Sarah Miller'
    });
  };

  const startEdit = (log: MaintenanceEntry) => {
    setEditingId(log.id);
    setFormData({
      balloonName: log.balloonName,
      date: log.date,
      serviceType: log.serviceType,
      partsUsed: log.partsUsed,
      notes: log.notes,
      technician: log.technician
    });
    setIsFormOpen(true);
  };

  return (
    <section className="mt-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t pt-12 dark:border-primary/30">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Wrench className="text-primary" /> Aeronautical Maintenance Hub
          </h2>
          <p className="text-sm text-muted-foreground italic">Required FAA airworthiness logging and structural inspections.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          {isFormOpen ? <X size={18} /> : <Plus size={18} />}
          {isFormOpen ? 'Cancel Entry' : 'New Maintenance Log'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                  <Plane size={12} /> Target Vessel
                </label>
                <select 
                  value={formData.balloonName}
                  onChange={(e) => setFormData({ ...formData, balloonName: e.target.value })}
                  className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  {balloons.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                  <Calendar size={12} /> Service Date
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                  <Settings size={12} /> Service Type
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 100-Hour Inspection"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                <History size={12} /> Parts & Components Replaced
              </label>
              <input 
                type="text" 
                placeholder="e.g. Fuel hose gasket, wicker sealant..."
                value={formData.partsUsed}
                onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
                className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                <FileText size={12} /> Technician Observations
              </label>
              <textarea 
                placeholder="Details of inspection findings..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-background border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-all">Discard</button>
              <button type="submit" className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
                <Save size={16} /> {editingId ? 'Update Log' : 'Seal Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-background border dark:border-primary/30 rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Wrench size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-primary tracking-widest">{log.balloonName}</div>
                  <h4 className="font-bold text-lg">{log.serviceType}</h4>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {new Date(log.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(log)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => onDelete(log.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-muted/20 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Technician Notes</div>
                <p className="text-xs text-muted-foreground leading-relaxed">"{log.notes}"</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-1">
                <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Technician: {log.technician}</div>
                <div className="flex items-center gap-1">Parts: {log.partsUsed || 'None'}</div>
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
            <Wrench size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground">No maintenance logs found</h3>
            <p className="text-sm text-muted-foreground mt-2">Historical aircraft service data will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};
