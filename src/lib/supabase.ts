import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
      };
      prayers: {
        Row: {
          id: string;
          title: string;
          content: string;
          meaning: string;
          audio_file: string | null;
          duration_minutes: number;
          is_premium: boolean;
          order: number;
        };
      };
      bell_alarms: {
        Row: {
          id: string;
          user_id: string;
          time: string;
          sound_type: 'bell' | 'nature' | 'vibration';
          is_active: boolean;
          repeat_days: number[];
          label: string | null;
        };
        Insert: {
          user_id: string;
          time: string;
          sound_type?: 'bell' | 'nature' | 'vibration';
          is_active?: boolean;
          repeat_days?: number[];
          label?: string | null;
        };
        Update: {
          time?: string;
          sound_type?: 'bell' | 'nature' | 'vibration';
          is_active?: boolean;
          repeat_days?: number[];
          label?: string | null;
        };
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          mood: number;
          tags: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          mood: number;
          tags?: string[];
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          prayer_count: number;
          journal_streak: number;
          total_minutes: number;
          last_prayer_date: string | null;
          last_journal_date: string | null;
        };
      };
    };
  };
};
