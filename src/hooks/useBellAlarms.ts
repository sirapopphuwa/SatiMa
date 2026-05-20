import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BellAlarm } from '@/types';

const FREE_ALARM_LIMIT = 2;

export function useBellAlarms() {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<BellAlarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isPremium = user?.is_premium ?? false;

  const fetchAlarms = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from('bell_alarms')
      .select('*')
      .eq('user_id', user.id)
      .order('time', { ascending: true });

    setAlarms((data as BellAlarm[]) ?? []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchAlarms(); }, [fetchAlarms]);

  async function addAlarm(payload: Omit<BellAlarm, 'id' | 'user_id'>): Promise<string | null> {
    if (!user) return 'กรุณาเข้าสู่ระบบ';
    if (!isPremium && alarms.filter((a) => a.is_active).length >= FREE_ALARM_LIMIT) {
      return `ฟรีตั้งได้ ${FREE_ALARM_LIMIT} ระฆัง — อัปเกรดเพื่อไม่จำกัด`;
    }

    const { data, error } = await supabase
      .from('bell_alarms')
      .insert({ user_id: user.id, ...payload })
      .select()
      .single();

    if (error) return error.message;
    const newAlarm = data as BellAlarm;
    setAlarms((prev) => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    await scheduleNotification(newAlarm);
    return null;
  }

  async function toggleAlarm(id: string) {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;
    const newActive = !alarm.is_active;

    await supabase.from('bell_alarms').update({ is_active: newActive }).eq('id', id);
    setAlarms((prev) => prev.map((a) => a.id === id ? { ...a, is_active: newActive } : a));

    if (newActive) {
      await scheduleNotification({ ...alarm, is_active: true });
    } else {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }

  async function deleteAlarm(id: string) {
    await supabase.from('bell_alarms').delete().eq('id', id);
    await Notifications.cancelScheduledNotificationAsync(id);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }

  return { alarms, isLoading, isPremium, addAlarm, toggleAlarm, deleteAlarm, refetch: fetchAlarms };
}

async function scheduleNotification(alarm: BellAlarm) {
  if (alarm.sound_type === 'vibration' || !alarm.is_active) return;
  const [h, m] = alarm.time.split(':').map(Number);

  try {
    await Notifications.cancelScheduledNotificationAsync(alarm.id);

    const trigger = new Date();
    trigger.setHours(h, m, 0, 0);
    if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      identifier: alarm.id,
      content: {
        title: '🔔 เวลาเตือนสติ',
        body: 'หยุดพักและหายใจลึกๆ สักครู่',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });
  } catch {
    // ไม่มีสิทธิ์แจ้งเตือน — ข้ามได้
  }
}
