import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserStats } from '@/types';

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) setStats(data as UserStats);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  async function incrementPrayerCount() {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from('user_stats')
      .update({
        prayer_count: (stats?.prayer_count ?? 0) + 1,
        last_prayer_date: today,
      })
      .eq('user_id', user.id);
    fetchStats();
  }

  async function addMinutes(minutes: number) {
    if (!user) return;
    await supabase
      .from('user_stats')
      .update({ total_minutes: (stats?.total_minutes ?? 0) + minutes })
      .eq('user_id', user.id);
    fetchStats();
  }

  return { stats, fetchStats, incrementPrayerCount, addMinutes };
}
