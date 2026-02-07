import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ScheduleItem } from '../components/ScheduleUI';

interface DbScheduleItem {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  requires_crew: boolean;
}

function toScheduleItem(row: DbScheduleItem): ScheduleItem {
  return {
    id: row.id,
    type: row.type as ScheduleItem['type'],
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    description: row.description,
    attendees: row.attendees,
    requiresCrew: row.requires_crew,
  };
}

export function useScheduleItems() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schedule_items')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setItems((data as DbScheduleItem[]).map(toScheduleItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, refetch: fetchItems };
}
