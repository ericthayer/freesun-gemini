import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useCrewMembers } from '../hooks/useCrewMembers';
import { CrewProfileForm } from '../components/CrewProfileForm';
import type { CrewMember } from '../components/CrewUI';
import type { PersonalLink } from '../components/profile/PersonalLinksEditor';
import { supabase } from '../lib/supabaseClient';

const ProfileSettings: React.FC = () => {
  const { crewProfile, loading: authLoading, refreshProfile } = useAuth();
  const { crewMembers, updateCrewMember, loading: crewLoading } = useCrewMembers();
  const navigate = useNavigate();
  const [member, setMember] = useState<CrewMember | null>(null);
  const [personalLinks, setPersonalLinks] = useState<PersonalLink[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (crewProfile && crewMembers.length > 0) {
      const matched = crewMembers.find(m => m.id === crewProfile.id);
      if (matched) {
        setMember(matched);

        const fetchLinks = async () => {
          const { data } = await supabase
            .from('crew_members')
            .select('personal_urls')
            .eq('id', crewProfile.id)
            .maybeSingle();

          if (data?.personal_urls) {
            try {
              const urls = typeof data.personal_urls === 'string'
                ? JSON.parse(data.personal_urls)
                : data.personal_urls;
              if (Array.isArray(urls)) setPersonalLinks(urls);
            } catch {
              setPersonalLinks([]);
            }
          }
        };
        fetchLinks();
      }
    }
  }, [crewProfile, crewMembers]);

  const handleUpdate = async (updated: CrewMember, extras?: { personalLinks?: PersonalLink[] }) => {
    try {
      await updateCrewMember(updated, extras);
      await refreshProfile();
      setMember(updated);
      if (extras?.personalLinks) setPersonalLinks(extras.personalLinks);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMessage(null), 6000);
    }
  };

  if (authLoading || crewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!crewProfile || !member) {
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

      <div className="bg-background border rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <CrewProfileForm
          member={member}
          onUpdate={handleUpdate}
          onCancel={() => navigate(-1)}
          personalLinks={personalLinks}
        />
      </div>
    </div>
  );
};

export default ProfileSettings;
