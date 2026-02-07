import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, Phone, MapPin, FileText, ImageIcon, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialty: string;
  image_url: string;
  availability: 'available' | 'busy';
  experience_years: number;
}

const ProfileSettings: React.FC = () => {
  const { crewProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialty: '',
    image_url: '',
    availability: 'available',
    experience_years: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (crewProfile) {
      setFormData({
        name: crewProfile.name || '',
        email: crewProfile.email || '',
        phone: '',
        bio: crewProfile.bio || '',
        specialty: crewProfile.specialty || '',
        image_url: crewProfile.image_url || '',
        availability: crewProfile.availability || 'available',
        experience_years: crewProfile.experience_years || 0,
      });

      const fetchFullProfile = async () => {
        const { data } = await supabase
          .from('crew_members')
          .select('*')
          .eq('id', crewProfile.id)
          .maybeSingle();

        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            specialty: data.specialty || '',
            image_url: data.image_url || '',
            availability: data.availability || 'available',
            experience_years: data.experience_years || 0,
          });
        }
      };

      fetchFullProfile();
    }
  }, [crewProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!crewProfile) {
      setMessage({ type: 'error', text: 'No profile found. Please log in again.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('crew_members')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          specialty: formData.specialty,
          image_url: formData.image_url,
          availability: formData.availability,
          experience_years: formData.experience_years,
        })
        .eq('id', crewProfile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => {
        navigate('/portal');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!crewProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
          <p className="text-muted-foreground">Please log in to access your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black italic mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Update your personal information and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in duration-300 ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-muted/30 border dark:border-primary/20 p-8 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>

          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User size={16} /> Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone size={16} /> Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image_url" className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon size={16} /> Profile Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {formData.image_url && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary/20">
                <img
                  src={formData.image_url}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted/30 border dark:border-primary/20 p-8 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold mb-4">Professional Details</h2>

          <div className="space-y-2">
            <label htmlFor="specialty" className="flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} /> Specialty
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., High-altitude navigation, Weather analysis"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="experience_years" className="flex items-center gap-2 text-sm font-medium">
              <FileText size={16} /> Years of Experience
            </label>
            <input
              type="number"
              id="experience_years"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              max="99"
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="availability" className="flex items-center gap-2 text-sm font-medium">
              <User size={16} /> Availability Status
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
              <FileText size={16} /> Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-background border dark:border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/portal')}
            className="px-6 py-4 rounded-2xl font-bold border border-border hover:bg-muted/50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
