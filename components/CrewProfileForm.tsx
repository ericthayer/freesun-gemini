
import React, { useState } from 'react';
import { User, Users, Mail, Phone, Briefcase, FileText, Camera, X, Plus, Award } from 'lucide-react';
import { CrewMember } from './CrewUI';
import { ImageUpload } from './ImageUploadUI';

interface CrewProfileFormProps {
  member: CrewMember;
  onUpdate: (updated: CrewMember) => void;
  onCancel: () => void;
  title?: string;
}

export const CrewProfileForm: React.FC<CrewProfileFormProps> = ({ 
  member, 
  onUpdate, 
  onCancel,
  title = "Edit Profile"
}) => {
  const [formData, setFormData] = React.useState<CrewMember>(member);
  const [newCert, setNewCert] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const addCert = () => {
    if (newCert.trim() && !formData.certifications.includes(newCert.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCert.trim()]
      });
      setNewCert('');
    }
  };

  const removeCert = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(c => c !== cert)
    });
  };

  return (
    <div className="bg-muted/30 border-2 border-primary/30 rounded-[2rem] p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Edit2Icon /> {title}: {member.name}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Upload Section */}
          <div className="shrink-0 space-y-2 flex flex-col items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Camera size={12} /> Profile Photo
            </label>
            <ImageUpload 
              currentImage={formData.imageUrl} 
              onImageChange={(newImage) => setFormData({ ...formData, imageUrl: newImage })}
            />
            <p className="text-[10px] text-muted-foreground text-center max-w-[120px]">
              JPG, PNG or GIF. Max 5MB recommended.
            </p>
          </div>

          {/* Fields Section */}
          <div className="flex-grow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                  <User size={12} /> Full Name
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                  <Users size={12} /> Role
                </label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="Pilot">Pilot</option>
                  <option value="Ground Crew">Ground Crew</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                  <Mail size={12} /> Email
                </label>
                <input 
                  type="email" 
                  required 
                  value={formData.contact.email} 
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                  <Phone size={12} /> Phone
                </label>
                <input 
                  type="tel" 
                  required 
                  value={formData.contact.phone} 
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                  <Briefcase size={12} /> Years Experience
                </label>
                <input 
                  type="number" 
                  required 
                  min="0" 
                  value={formData.experience} 
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Award size={12} /> Certifications & Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.certifications.map((cert) => (
              <span key={cert} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold border border-primary/20 group">
                {cert}
                <button 
                  type="button" 
                  onClick={() => removeCert(cert)}
                  className="hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Master Pilot, EMT Basic..." 
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
              className="flex-grow bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button 
              type="button"
              onClick={addCert}
              className="bg-muted hover:bg-muted/80 p-2 rounded-xl transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <FileText size={12} /> Bio
          </label>
          <textarea 
            value={formData.bio} 
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px] resize-none" 
          />
        </div>
        <div className="flex justify-end gap-3">
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const Edit2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);
