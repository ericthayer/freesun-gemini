import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Balloon {
  id: string;
  name: string;
  type: string;
  description: string;
  volume: string;
  capacity: string;
  burner: string;
  image_url: string;
}

export function useBalloons() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalloons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('balloons')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setBalloons(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBalloons();
  }, [fetchBalloons]);

  const balloonNames = balloons.map(b => b.name);

  return { balloons, balloonNames, loading, refetch: fetchBalloons };
}
