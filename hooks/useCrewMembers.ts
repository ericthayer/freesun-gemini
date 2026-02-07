import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { CrewMember } from '../components/CrewUI';

interface DbCrewMember {
  id: string;
  name: string;
  role: 'Pilot' | 'Ground Crew';
  experience_years: number;
  email: string;
  phone: string;
  certifications: string[];
  bio: string;
  image_url: string;
  availability: 'available' | 'busy';
  specialty: string;
  flights: number;
}

function toCrewMember(row: DbCrewMember): CrewMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    experience: row.experience_years,
    contact: { email: row.email, phone: row.phone },
    certifications: row.certifications || [],
    bio: row.bio,
    imageUrl: row.image_url,
    availability: row.availability,
  };
}

export interface ShowcaseMember {
  id: string;
  name: string;
  role: 'Pilot' | 'Ground Crew';
  experience: string;
  flights: number;
  specialty: string;
  imageUrl: string;
  bio: string;
}

function toShowcaseMember(row: DbCrewMember): ShowcaseMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    experience: `${row.experience_years} Years`,
    flights: row.flights,
    specialty: row.specialty,
    imageUrl: row.image_url,
    bio: row.bio,
  };
}

export function useCrewMembers() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [showcaseMembers, setShowcaseMembers] = useState<ShowcaseMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrew = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crew_members')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const rows = data as DbCrewMember[];
      setCrewMembers(rows.map(toCrewMember));
      setShowcaseMembers(rows.map(toShowcaseMember));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  const updateCrewMember = useCallback(async (member: CrewMember) => {
    const { error } = await supabase
      .from('crew_members')
      .update({
        name: member.name,
        role: member.role,
        experience_years: member.experience,
        email: member.contact.email,
        phone: member.contact.phone,
        certifications: member.certifications,
        bio: member.bio,
        image_url: member.imageUrl || '',
        availability: member.availability,
      })
      .eq('id', member.id);

    if (!error) {
      setCrewMembers(prev => prev.map(m => m.id === member.id ? member : m));
    }
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const member = crewMembers.find(m => m.id === id);
    if (!member) return;

    const newAvailability = member.availability === 'available' ? 'busy' : 'available';
    const { error } = await supabase
      .from('crew_members')
      .update({ availability: newAvailability })
      .eq('id', id);

    if (!error) {
      setCrewMembers(prev => prev.map(m =>
        m.id === id ? { ...m, availability: newAvailability as 'available' | 'busy' } : m
      ));
    }
  }, [crewMembers]);

  return { crewMembers, showcaseMembers, loading, refetch: fetchCrew, updateCrewMember, toggleAvailability };
}
