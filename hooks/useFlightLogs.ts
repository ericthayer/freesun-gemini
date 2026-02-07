import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { FlightLog, LogAttachment } from '../components/LogsUI';

interface DbFlightLog {
  id: string;
  log_number: string;
  date: string;
  duration_minutes: number;
  site: string;
  notes: string;
  status: string;
  log_attachments: { id: string; url: string; type: string }[];
}

function toFlightLog(row: DbFlightLog): FlightLog {
  return {
    id: row.log_number,
    date: row.date,
    duration: String(row.duration_minutes),
    site: row.site,
    notes: row.notes,
    status: row.status,
    attachments: row.log_attachments?.map(a => ({
      url: a.url,
      type: a.type as 'image' | 'video',
    })),
  };
}

export function useFlightLogs() {
  const [logs, setLogs] = useState<FlightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flight_logs')
      .select('*, log_attachments(*)')
      .order('date', { ascending: false });

    if (!error && data) {
      setLogs((data as DbFlightLog[]).map(toFlightLog));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (log: { date: string; duration: string; site: string; notes: string; attachments: LogAttachment[] }) => {
    const { data: maxRow } = await supabase
      .from('flight_logs')
      .select('log_number')
      .order('log_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNumber = String((parseInt(maxRow?.log_number || '0') || 0) + 1);

    const { data: inserted, error } = await supabase
      .from('flight_logs')
      .insert({
        log_number: nextNumber,
        date: log.date,
        duration_minutes: parseInt(log.duration) || 60,
        site: log.site,
        notes: log.notes,
        status: 'PENDING REVIEW',
      })
      .select()
      .maybeSingle();

    if (!error && inserted && log.attachments?.length) {
      await supabase.from('log_attachments').insert(
        log.attachments.map(a => ({
          flight_log_id: inserted.id,
          url: a.url,
          type: a.type,
        }))
      );
    }

    await fetchLogs();
  }, [fetchLogs]);

  const archiveLog = useCallback(async (logNumber: string) => {
    const { data: row } = await supabase
      .from('flight_logs')
      .select('id')
      .eq('log_number', logNumber)
      .maybeSingle();

    if (row) {
      await supabase.from('flight_logs').delete().eq('id', row.id);
      setLogs(prev => prev.filter(l => l.id !== logNumber));
    }
  }, []);

  return { logs, loading, refetch: fetchLogs, addLog, archiveLog };
}
