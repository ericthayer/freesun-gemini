import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  sort_order: number;
}

export function useChecklists() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setChecklists(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const toggleItem = useCallback(async (id: string) => {
    const item = checklists.find(c => c.id === id);
    if (!item) return;

    const { error } = await supabase
      .from('checklists')
      .update({ done: !item.done })
      .eq('id', id);

    if (!error) {
      setChecklists(prev => prev.map(c =>
        c.id === id ? { ...c, done: !c.done } : c
      ));
    }
  }, [checklists]);

  return { checklists, loading, refetch: fetchChecklists, toggleItem };
}
