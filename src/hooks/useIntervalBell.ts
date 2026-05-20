import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

import { IntervalBell } from '@/types';

const STORAGE_KEY = '@satima_interval_bell';
const PREFIX = 'ibv_'; // interval bell notification prefix

// ── Public hook ────────────────────────────────────────────────────────────────

export function useIntervalBell() {
  const [bell, setBell] = useState<IntervalBell | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: IntervalBell | null = raw ? JSON.parse(raw) : null;
      setBell(parsed);
      // Auto-reschedule if active but no notifications are queued
      if (parsed?.is_active) {
        const all = await Notifications.getAllScheduledNotificationsAsync();
        const hasQueued = all.some((n) => n.identifier.startsWith(PREFIX));
        if (!hasQueued) await scheduleIntervalNotifs(parsed);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Save (create/update) the interval bell and reschedule notifications */
  async function save(data: IntervalBell) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setBell(data);
    await cancelIntervalNotifs();
    if (data.is_active) await scheduleIntervalNotifs(data);
  }

  /** Toggle active/inactive */
  async function toggle() {
    if (!bell) return;
    await save({ ...bell, is_active: !bell.is_active });
  }

  /** Delete the interval bell and cancel all its notifications */
  async function remove() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await cancelIntervalNotifs();
    setBell(null);
  }

  return { bell, loading, save, toggle, remove };
}

// ── Helper exported for UI preview ─────────────────────────────────────────────

/** Returns how many times the bell will ring per day given the window & interval */
export function countRingsPerDay(
  intervalMin: number,
  startTime: string,
  endTime: string,
): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const spanMins = eh * 60 + em - (sh * 60 + sm);
  if (spanMins <= 0 || intervalMin <= 0) return 0;
  return Math.floor(spanMins / intervalMin) + 1;
}

// ── Private scheduling helpers ─────────────────────────────────────────────────

async function cancelIntervalNotifs() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => n.identifier.startsWith(PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // ignore
  }
}

/**
 * Schedule up to 60 notifications:
 *   - remaining slots for today (future only)
 *   - all slots for tomorrow
 * iOS allows max ~64 scheduled notifications globally, so we stay safe.
 */
async function scheduleIntervalNotifs(bell: IntervalBell) {
  const MAX = 60;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const times: Date[] = [];
  const now = new Date();

  for (const [base, onlyFuture] of [
    [today, true],
    [tomorrow, false],
  ] as [Date, boolean][]) {
    if (times.length >= MAX) break;

    const [sh, sm] = bell.start_time.split(':').map(Number);
    const [eh, em] = bell.end_time.split(':').map(Number);
    const cursor = new Date(base);
    cursor.setHours(sh, sm, 0, 0);
    const endD = new Date(base);
    endD.setHours(eh, em, 0, 0);

    while (cursor <= endD && times.length < MAX) {
      if (!onlyFuture || cursor > now) {
        times.push(new Date(cursor));
      }
      cursor.setMinutes(cursor.getMinutes() + bell.interval_minutes);
    }
  }

  for (const t of times) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}${t.getTime()}`,
        content: {
          title: '🔔 เวลาเตือนสติ',
          body: 'หยุดพักสักครู่ • หายใจลึกๆ',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: t,
        },
      });
    } catch {
      break; // reached iOS notification limit — stop gracefully
    }
  }
}
