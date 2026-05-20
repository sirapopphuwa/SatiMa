import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GradientScreen } from '@/components/GradientScreen';
import { Font, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePrayers } from '@/hooks/usePrayers';
import { Prayer } from '@/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'สวัสดีตอนเช้า', emoji: '🌅', sub: 'เริ่มต้นวันด้วยสติ' };
  if (h < 17) return { text: 'สวัสดีตอนบ่าย', emoji: '☀️', sub: 'พักสักครู่กับบทสวด' };
  if (h < 20) return { text: 'สวัสดีตอนเย็น', emoji: '🌆', sub: 'ผ่อนคลายจิตใจ' };
  return { text: 'สวัสดีตอนค่ำ', emoji: '🌙', sub: 'สงบจิตก่อนนอน' };
}

// Warmer card bg colors for dark/light
const CARD_BG_LIGHT = ['#F0EAFF', '#FFF4EE', '#EDFFF5', '#FFF8EC', '#F4EEFF', '#FDEEF7'];
const CARD_BG_DARK  = ['#211840', '#281A10', '#0D2820', '#281E08', '#1C1040', '#280D1E'];
const CARD_ICONS = ['🪷', '🙏', '☯️', '📿', '🕯️', '🌸'];

function PrayerCard({ prayer, onPress, isPremiumUser, index }: {
  prayer: Prayer; onPress: () => void; isPremiumUser: boolean; index: number;
}) {
  const { colors, isDark } = useTheme();
  const isLocked = prayer.is_premium && !isPremiumUser;
  const cardBg = isDark ? CARD_BG_DARK[index % 6] : CARD_BG_LIGHT[index % 6];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.prayerCard, Shadow.light, { backgroundColor: colors.surface }]}>
        <View style={[styles.prayerIcon, { backgroundColor: cardBg }]}>
          <Text style={{ fontSize: 22 }}>{CARD_ICONS[index % 6]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.bodyMedium, { color: colors.text }]}>{prayer.title}</Text>
          <View style={styles.metaRow}>
            <Clock size={11} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {prayer.duration_minutes} นาที
            </Text>
          </View>
        </View>
        {isLocked ? (
          <View style={[styles.lockBadge, { backgroundColor: colors.accent + '22' }]}>
            <Text style={{ fontSize: 11 }}>🔒</Text>
            <Text style={[Typography.small, { color: colors.accent, fontFamily: Font.bold }]}>Premium</Text>
          </View>
        ) : (
          <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: Font.bold }}>▶</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function PrayerScreen() {
  const { colors, heroGradient } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const greeting = getGreeting();
  const { prayers, isLoading } = usePrayers();

  return (
    <GradientScreen>
      <FlatList
        data={prayers}
        refreshing={isLoading}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'ios' ? 110 : 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <LinearGradient
              colors={heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontFamily: Font.medium, fontSize: 12, letterSpacing: 0.4 }}>
                    {greeting.sub}
                  </Text>
                  <Text style={styles.heroTitle}>{greeting.text} {greeting.emoji}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: Font.regular, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
                    {user?.name ?? 'คุณ'} วันนี้จะสวดบทไหนดี?
                  </Text>
                </View>
                <View style={styles.heroEmoji}>
                  <Text style={{ fontSize: 40 }}>🪷</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                {[
                  { label: 'บทสวด', value: `${prayers.length}` },
                  { label: 'นาทีรวม', value: '30+' },
                  { label: 'ทุกระดับ', value: '✓' },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={{ color: '#fff', fontFamily: Font.extrabold, fontSize: 18 }}>{s.value}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontFamily: Font.regular, fontSize: 11 }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>บทสวดมนต์</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <PrayerCard
            prayer={item}
            onPress={() => router.push(`/prayer/${item.id}`)}
            isPremiumUser={user?.is_premium ?? false}
            index={index}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg },
  header: { marginBottom: Spacing.md, gap: Spacing.lg },
  heroCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  heroTitle: {
    fontSize: 21,
    fontFamily: Font.extrabold,
    color: '#fff',
    marginTop: 6,
    letterSpacing: -0.3,
  },
  heroEmoji: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: Spacing.md,
  },
  statItem: { alignItems: 'center', gap: 2 },
  sectionTitle: { fontSize: 18, fontFamily: Font.bold },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  prayerIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
