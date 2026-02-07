import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MaintenanceEntry } from '../components/MaintenanceUI';

interface DbMaintenanceLog {
  id: string;
  balloon_name: string;
  date: string;
  service_type: string;
  parts_used: string;
  notes: string;
  technician: string;
}

function toMaintenanceEntry(row: DbMaintenanceLog): MaintenanceEntry {
  return {
    id: row.id,
    balloonName: row.balloon_name,
    date: row.date,
    serviceType: row.service_type,
    partsUsed: row.parts_used,
    notes: row.notes,
    technician: row.technician,
  };
}

export function useMaintenanceLogs() {
  const [logs, setLogs] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs((data as DbMaintenanceLog[]).map(toMaintenanceEntry));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (entry: MaintenanceEntry) => {
    const { error } = await supabase.from('maintenance_logs').insert({
      balloon_name: entry.balloonName,
      date: entry.date,
      service_type: entry.serviceType,
      parts_used: entry.partsUsed,
      notes: entry.notes,
      technician: entry.technician,
    });

    if (!error) await fetchLogs();
  }, [fetchLogs]);

  const updateLog = useCallback(async (entry: MaintenanceEntry) => {
    const { error } = await supabase
      .from('maintenance_logs')
      .update({
        balloon_name: entry.balloonName,
        date: entry.date,
        service_type: entry.serviceType,
        parts_used: entry.partsUsed,
        notes: entry.notes,
        technician: entry.technician,
      })
      .eq('id', entry.id);

    if (!error) {
      setLogs(prev => prev.map(l => l.id === entry.id ? entry : l));
    }
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('maintenance_logs')
      .delete()
      .eq('id', id);

    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  }, []);

  return { logs, loading, refetch: fetchLogs, addLog, updateLog, deleteLog };
}
