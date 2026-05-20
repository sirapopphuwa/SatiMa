export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  meaning: string;
  audio_file: string | null;
  duration_minutes: number;
  is_premium: boolean;
  order: number;
}

export interface BellAlarm {
  id: string;
  user_id: string;
  time: string;
  sound_type: 'bell' | 'nature' | 'vibration';
  is_active: boolean;
  repeat_days: number[];
  label?: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Journal {
  id: string;
  user_id: string;
  content: string;
  mood: MoodLevel;
  tags: string[];
  created_at: string;
}

export interface UserStats {
  user_id: string;
  prayer_count: number;
  journal_streak: number;
  total_minutes: number;
  last_prayer_date: string | null;
  last_journal_date: string | null;
}

export interface IntervalBell {
  id: string;
  interval_minutes: number;
  start_time: string;   // "HH:MM"
  end_time: string;     // "HH:MM"
  is_active: boolean;
  sound_type: SoundType;
}

export type SoundType = 'bell' | 'nature' | 'vibration';

export const SOUND_TYPE_LABELS: Record<SoundType, string> = {
  bell: 'เสียงระฆัง',
  nature: 'เสียงธรรมชาติ',
  vibration: 'สั่นอย่างเดียว',
};

export const PREDEFINED_TAGS = [
  '#ครอบครัว',
  '#งาน',
  '#สุขภาพ',
  '#สติ',
  '#ความสัมพันธ์',
  '#การเงิน',
  '#ความฝัน',
  '#ขอบคุณ',
];
