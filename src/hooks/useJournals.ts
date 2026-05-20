import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Journal, MoodLevel } from '@/types';

export function useJournals() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJournals = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(120);

    setJournals((data as Journal[]) ?? []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  async function addJournal(payload: { content: string; mood: MoodLevel; tags: string[]; emoji?: string }) {
    if (!user) return;
    const { data, error } = await supabase
      .from('journals')
      .insert({ user_id: user.id, ...payload })
      .select()
      .single();

    if (!error && data) {
      setJournals((prev) => [data as Journal, ...prev]);
      // อัปเดต streak ใน user_stats
      await updateJournalStreak(user.id);
    }
  }

  return { journals, isLoading, addJournal, refetch: fetchJournals };
}

async function updateJournalStreak(userId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: stats } = await supabase
    .from('user_stats')
    .select('journal_streak, last_journal_date')
    .eq('user_id', userId)
    .single();

  if (!stats) return;

  const last = stats.last_journal_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const newStreak =
    last === yesterday
      ? stats.journal_streak + 1
      : last === today
        ? stats.journal_streak
        : 1;

  await supabase
    .from('user_stats')
    .update({ journal_streak: newStreak, last_journal_date: today })
    .eq('user_id', userId);
}
