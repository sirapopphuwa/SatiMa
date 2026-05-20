import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Crown, LogOut, Moon, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GradientScreen } from '@/components/GradientScreen';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ACCENT_THEMES, AccentTheme, Font, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStats } from '@/hooks/useUserStats';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, Shadow.light, { backgroundColor: colors.surface }]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  label,
  rightElement,
  onPress,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  tint?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: (tint ?? colors.primary) + '15' }]}>
        {icon}
      </View>
      <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
      {rightElement}
    </Pressable>
  );
}

// ─── Color Theme Picker ───────────────────────────────────────────────────────

function ThemePicker() {
  const { colors, accentTheme, setAccentTheme } = useTheme();
  const entries = Object.entries(ACCENT_THEMES) as [AccentTheme, typeof ACCENT_THEMES[AccentTheme]][];

  return (
    <View style={[styles.settingsCard, Shadow.light, { backgroundColor: colors.surface }]}>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.md, fontFamily: Font.semibold, letterSpacing: 0.5 }]}>
        สีธีม
      </Text>

      <View style={styles.themeGrid}>
        {entries.map(([key, theme]) => {
          const isActive = accentTheme === key;
          return (
            <Pressable
              key={key}
              onPress={() => setAccentTheme(key)}
              style={styles.themeItem}
            >
              {/* Gradient swatch */}
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.themeSwatch,
                  isActive && styles.themeSwatchActive,
                ]}
              >
                {isActive && (
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: Font.bold }}>✓</Text>
                )}
              </LinearGradient>
              <Text style={[
                Typography.small,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  textAlign: 'center',
                  fontFamily: isActive ? Font.semibold : Font.regular,
                  marginTop: 4,
                },
              ]}>
                {theme.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme, heroGradient } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  const { stats } = useUserStats();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
    : '';

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfile({ avatar_url: result.assets[0].uri });
    }
  }

  async function handleSaveName() {
    if (nameInput.trim()) {
      await updateProfile({ name: nameInput.trim() });
      setIsEditingName(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === 'ios' ? 110 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Pressable onPress={handlePickAvatar} style={styles.avatarWrapper}>
            <Avatar uri={user?.avatar_url} name={user?.name} size={84} />
            <View style={styles.avatarBadge}>
              <Text style={{ fontSize: 13 }}>✏️</Text>
            </View>
          </Pressable>

          {isEditingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[styles.nameInput, { color: '#fff', borderBottomColor: 'rgba(255,255,255,0.6)' }]}
                autoFocus
                onSubmitEditing={handleSaveName}
              />
              <Pressable onPress={handleSaveName} style={styles.saveBtn}>
                <Text style={{ color: '#fff', fontFamily: Font.bold, fontSize: 13 }}>บันทึก</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setIsEditingName(true)}>
              <Text style={[styles.userName, { color: '#fff' }]}>
                {user?.name ?? 'ผู้ใช้'} ✏️
              </Text>
            </Pressable>
          )}

          <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.75)', textAlign: 'center' }]}>
            {joinDate ? `สมาชิกตั้งแต่ ${joinDate}` : 'ยินดีต้อนรับ'}
          </Text>

          {user?.is_premium && (
            <View style={styles.premiumBadge}>
              <Crown size={13} color="#FFB800" />
              <Text style={[Typography.small, { color: '#FFB800', fontFamily: Font.bold }]}>PREMIUM</Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Streak ────────────────────────────────────────────────────── */}
        <View style={[styles.streakCard, Shadow.light, { backgroundColor: colors.surface }]}>
          <View style={styles.streakRow}>
            <View style={[styles.streakIcon, { backgroundColor: '#FF6B3515' }]}>
              <Text style={{ fontSize: 28 }}>🔥</Text>
            </View>
            <View>
              <Text style={[styles.streakNum, { color: colors.text }]}>{stats?.journal_streak ?? 0}</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>วันติดต่อกัน</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={[styles.streakBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[Typography.small, { color: colors.primary, fontFamily: Font.semibold }]}>🎯 Keep going!</Text>
            </View>
          </View>
        </View>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard label="สวดมนต์" value={`${stats?.prayer_count ?? 0}`} icon="🪷" />
          <StatCard label="บันทึก" value={`${stats?.journal_streak ?? 0} วัน`} icon="📓" />
          <StatCard label="เวลารวม" value={`${Math.floor((stats?.total_minutes ?? 0) / 60)} ชม.`} icon="⏱️" />
        </View>

        {/* ── Upgrade ───────────────────────────────────────────────────── */}
        {!user?.is_premium && (
          <Button
            label="อัปเกรดเป็น Premium ✨"
            onPress={() => Alert.alert('Coming Soon', 'ฟีเจอร์นี้กำลังพัฒนา')}
            variant="premium"
            fullWidth
            size="lg"
          />
        )}

        {/* ── Color Theme Picker ────────────────────────────────────────── */}
        <ThemePicker />

        {/* ── Settings ──────────────────────────────────────────────────── */}
        <View style={[styles.settingsCard, Shadow.light, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.md, fontFamily: Font.semibold, letterSpacing: 0.5 }]}>
            ตั้งค่า
          </Text>

          <SettingsRow
            icon={isDark
              ? <Moon size={17} color={colors.secondary} />
              : <Sun size={17} color="#FFB800" />}
            label={isDark ? 'โหมดมืด' : 'โหมดสว่าง'}
            tint={isDark ? colors.secondary : '#FFB800'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingsRow
            icon={<Bell size={17} color={colors.primary} />}
            label="การแจ้งเตือน"
            onPress={() => Alert.alert('Coming Soon', 'ฟีเจอร์นี้กำลังพัฒนา')}
            rightElement={
              <View style={[styles.chevron, { backgroundColor: colors.primary + '15' }]}>
                <Text style={{ color: colors.primary, fontSize: 12 }}>›</Text>
              </View>
            }
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingsRow
            icon={<LogOut size={17} color="#FF5C5C" />}
            label="ออกจากระบบ"
            tint="#FF5C5C"
            onPress={handleSignOut}
            rightElement={
              <View style={[styles.chevron, { backgroundColor: '#FF5C5C15' }]}>
                <Text style={{ color: '#FF5C5C', fontSize: 12 }}>›</Text>
              </View>
            }
          />
        </View>

        <Text style={[Typography.small, { color: colors.textSecondary, textAlign: 'center' }]}>
          SatiMa v1.0.0
        </Text>
      </ScrollView>
    </GradientScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.md },

  // Header
  headerCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.xs },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nameInput: {
    fontSize: 20, fontFamily: Font.bold,
    borderBottomWidth: 1, minWidth: 120,
    textAlign: 'center', paddingBottom: 2,
  },
  saveBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full,
  },
  userName: { fontSize: 22, fontFamily: Font.extrabold, textAlign: 'center' },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderRadius: Radius.full,
  },

  // Streak
  streakCard: { borderRadius: Radius.lg, padding: Spacing.lg },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  streakIcon: { width: 56, height: 56, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  streakNum: { fontSize: 28, fontFamily: Font.extrabold },
  streakBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4,
    padding: Spacing.md, borderRadius: Radius.lg,
  },
  statValue: { fontSize: 17, fontFamily: Font.bold },

  // Color theme picker
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeItem: { alignItems: 'center', flex: 1 },
  themeSwatch: {
    width: 40, height: 40, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  themeSwatchActive: {
    width: 44, height: 44, borderRadius: Radius.sm,
    borderWidth: 2.5, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },

  // Settings
  settingsCard: { borderRadius: Radius.lg, padding: Spacing.lg },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  settingsIcon: { width: 38, height: 38, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginVertical: Spacing.xs },
  chevron: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
});
