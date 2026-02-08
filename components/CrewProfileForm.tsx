
import React, { useState } from 'react';
import { User, Users, Mail, Phone, Briefcase, FileText, Camera, X, Plus, Award } from 'lucide-react';
import { CrewMember } from './CrewUI';
import { ImageUpload } from './ImageUploadUI';
import { AiBioAssistant } from './profile/AiBioAssistant';
import { PersonalLinksEditor, PersonalLink } from './profile/PersonalLinksEditor';
import { useAuth } from '../lib/AuthContext';

interface CrewProfileFormProps {
  member: CrewMember;
  onUpdate: (updated: CrewMember, extras?: { personalLinks?: PersonalLink[] }) => void;
  onCancel: () => void;
  title?: string;
  personalLinks?: PersonalLink[];
}

export const CrewProfileForm: React.FC<CrewProfileFormProps> = ({
  member,
  onUpdate,
  onCancel,
  personalLinks: initialLinks = []
}) => {
  const [formData, setFormData] = React.useState<CrewMember>(member);
  const [newCert, setNewCert] = useState('');
  const [links, setLinks] = useState<PersonalLink[]>(initialLinks);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData, { personalLinks: links });
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
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-8">
        <div className="shrink-0 space-y-4 flex flex-col items-start">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
            <Camera size={12} /> Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <ImageUpload
              currentImage={formData.imageUrl}
              onImageChange={(newImage) => setFormData({ ...formData, imageUrl: newImage })}
              userId={user?.id}
            />
            <div className="max-w-[160px]">
              <p className="text-xs font-bold text-foreground mb-1">Upload new photo</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                JPG, PNG or WebP. Crop and adjust after selecting.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                <User size={12} /> Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                <Users size={12} /> Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Pilot' | 'Ground Crew' })}
                className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
                <option value="Pilot">Pilot</option>
                <option value="Ground Crew">Ground Crew</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              required
              value={formData.contact.email}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
              className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
                <Phone size={12} /> Phone
              </label>
              <input
                type="tel"
                required
                value={formData.contact.phone}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
            <span key={cert} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold border dark:border-primary/30 group">
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
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
            className="flex-grow bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button
            type="button"
            onClick={addCert}
            className="bg-primary/10 hover:bg-primary/20 p-2 rounded-xl text-primary transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
          <FileText size={12} /> Professional Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Brief summary of experience and flight philosophy..."
          className="w-full bg-muted/50 border dark:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] resize-none"
        />
        <AiBioAssistant
          name={formData.name}
          role={formData.role}
          experienceYears={formData.experience}
          certifications={formData.certifications}
          onAccept={(bio) => setFormData({ ...formData, bio })}
        />
      </div>

      <PersonalLinksEditor links={links} onChange={setLinks} />

      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-card py-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
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
  );
};
