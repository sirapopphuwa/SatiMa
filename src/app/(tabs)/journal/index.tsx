import { format, isSameDay, parseISO, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Edit3, Plus } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GradientScreen } from '@/components/GradientScreen';

import { Button } from '@/components/Button';
import { TagCloud } from '@/components/TagChip';
import { Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useJournals } from '@/hooks/useJournals';
import { Journal, MoodLevel, PREDEFINED_TAGS } from '@/types';

// ── Expanded emoji set (MOODA-style) ────────────────────────────────────────
const MOOD_OPTIONS = [
  { emoji: '🤩', label: 'สุดยอด', color: '#FFD166', bg: '#FFF8E1' },
  { emoji: '😄', label: 'มีความสุข', color: '#72E2A0', bg: '#E8FAF0' },
  { emoji: '🥰', label: 'รัก', color: '#FD79A8', bg: '#FDEEF5' },
  { emoji: '😊', label: 'ดี', color: '#4B8EF1', bg: '#EEF4FF' },
  { emoji: '😌', label: 'สงบ', color: '#98D8C8', bg: '#E8FAF7' },
  { emoji: '🙂', label: 'โอเค', color: '#72C3F8', bg: '#EEF7FF' },
  { emoji: '😎', label: 'เจ๋ง', color: '#A29BFE', bg: '#F0EEFF' },
  { emoji: '🤔', label: 'ครุ่นคิด', color: '#FDCB6E', bg: '#FFF8E8' },
  { emoji: '😐', label: 'เฉยๆ', color: '#B2BEC3', bg: '#F5F6F7' },
  { emoji: '😴', label: 'ง่วง', color: '#B2BEC3', bg: '#F5F6FA' },
  { emoji: '😟', label: 'กังวล', color: '#E17055', bg: '#FFF0ED' },
  { emoji: '😔', label: 'เศร้า', color: '#FF9A9A', bg: '#FFF0F0' },
  { emoji: '😤', label: 'หงุดหงิด', color: '#E17055', bg: '#FFF0ED' },
  { emoji: '😰', label: 'เครียด', color: '#A29BFE', bg: '#F0EEFF' },
  { emoji: '😭', label: 'ร้องไห้', color: '#FF7878', bg: '#FFF0F0' },
] as const;

type MoodOption = typeof MOOD_OPTIONS[number];

// Map MOOD_OPTIONS index → MoodLevel (1-5) for storage
function toMoodLevel(idx: number): MoodLevel {
  if (idx <= 1) return 5;
  if (idx <= 3) return 4;
  if (idx <= 5) return 3;
  if (idx <= 9) return 2;
  return 1;
}

// ── Large MOODA-style emoji picker ──────────────────────────────────────────
function MoodaEmojiPicker({
  selectedIndex,
  onChange,
}: {
  selectedIndex: number;
  onChange: (idx: number) => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const current = MOOD_OPTIONS[selectedIndex];

  function goNext() {
    animateChange(() => onChange((selectedIndex + 1) % MOOD_OPTIONS.length));
  }
  function goPrev() {
    animateChange(() => onChange((selectedIndex - 1 + MOOD_OPTIONS.length) % MOOD_OPTIONS.length));
  }
  function animateChange(cb: () => void) {
    opacity.value = withTiming(0, { duration: 100 }, () => {
      // RN bridge: call callback after fade out
    });
    scale.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withSpring(1),
    );
    opacity.value = withSequence(
      withTiming(0, { duration: 80 }),
      withTiming(1, { duration: 150 }),
    );
    cb();
  }

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.moodaCard, { backgroundColor: current.bg }]}>
      {/* Main emoji + arrows */}
      <View style={styles.moodaRow}>
        <Pressable onPress={goPrev} style={[styles.arrowBtn, { backgroundColor: colors.surface }]}>
          <ChevronLeft size={20} color={colors.primary} />
        </Pressable>

        <Pressable onPress={() => {}} style={styles.emojiCircle}>
          <Animated.Text style={[styles.bigEmoji, emojiStyle]}>
            {current.emoji}
          </Animated.Text>
        </Pressable>

        <Pressable onPress={goNext} style={[styles.arrowBtn, { backgroundColor: colors.surface }]}>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Label */}
      <Text style={[styles.moodLabel, { color: current.color }]}>{current.label}</Text>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {MOOD_OPTIONS.map((_, i) => (
          <Pressable key={i} onPress={() => onChange(i)}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: i === selectedIndex ? current.color : colors.border,
                  width: i === selectedIndex ? 18 : 6,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* Emoji grid for quick pick */}
      <View style={[styles.gridWrap, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
        <View style={styles.emojiGrid}>
          {MOOD_OPTIONS.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => { animateChange(() => onChange(i)); }}
              style={[
                styles.gridCell,
                i === selectedIndex && { backgroundColor: opt.color + '30', borderRadius: Radius.sm },
              ]}
            >
              <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────
const CALENDAR_DAYS = 30;

function CalendarView({ journals }: { journals: Journal[] }) {
  const { colors } = useTheme();
  const today = new Date();
  const days = Array.from({ length: CALENDAR_DAYS }, (_, i) => subDays(today, CALENDAR_DAYS - 1 - i));

  const emojiByDate = useMemo(() => {
    const map: Record<string, string> = {};
    journals.forEach((j) => {
      const dateKey = j.created_at.slice(0, 10);
      // Try to find stored emoji in content prefix or fallback to mood level
      const found = MOOD_OPTIONS.find((_, idx) => toMoodLevel(idx) === (j.mood as MoodLevel));
      map[dateKey] = found?.emoji ?? '🙂';
    });
    return map;
  }, [journals]);

  return (
    <View style={styles.calendarGrid}>
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const emoji = emojiByDate[key];
        const isToday = isSameDay(day, today);
        return (
          <View
            key={key}
            style={[
              styles.calendarDay,
              {
                backgroundColor: emoji ? '#EEF4FF' : colors.background,
                borderWidth: isToday ? 2 : 0,
                borderColor: isToday ? colors.primary : 'transparent',
              },
            ]}
          >
            {emoji ? (
              <Text style={{ fontSize: 14 }}>{emoji}</Text>
            ) : (
              <View style={[styles.emptyDot, { backgroundColor: colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Journal card ─────────────────────────────────────────────────────────────
function JournalCard({ journal }: { journal: Journal }) {
  const { colors } = useTheme();
  const date = parseISO(journal.created_at);
  const found = MOOD_OPTIONS.find((_, idx) => toMoodLevel(idx) === (journal.mood as MoodLevel));
  const moodOpt = found ?? MOOD_OPTIONS[5];

  return (
    <View style={[styles.journalCard, Shadow.light, { backgroundColor: colors.surface }]}>
      <View style={styles.journalHeader}>
        <View style={[styles.moodBubble, { backgroundColor: moodOpt.bg }]}>
          <Text style={{ fontSize: 24 }}>{moodOpt.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.bodyMedium, { color: colors.text }]}>{moodOpt.label}</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {format(date, 'd MMMM yyyy', { locale: th })}
          </Text>
          {journal.tags.length > 0 && (
            <Text style={[Typography.small, { color: colors.primary, marginTop: 2 }]}>
              {journal.tags.join('  ')}
            </Text>
          )}
        </View>
      </View>
      <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.sm, lineHeight: 22 }]} numberOfLines={3}>
        {journal.content}
      </Text>
    </View>
  );
}

// ── Write modal ───────────────────────────────────────────────────────────────
function WriteJournalModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { content: string; mood: MoodLevel; tags: string[]; emoji: string }) => void;
}) {
  const { colors } = useTheme();
  const [emojiIdx, setEmojiIdx] = useState(5);       // default: 🙂 "โอเค"
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handleSave() {
    if (!content.trim()) return;
    onSave({
      content: content.trim(),
      mood: toMoodLevel(emojiIdx),
      tags: selectedTags,
      emoji: MOOD_OPTIONS[emojiIdx].emoji,
    });
    setContent('');
    setEmojiIdx(5);
    setSelectedTags([]);
    onClose();
  }

  const current = MOOD_OPTIONS[emojiIdx];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Backdrop — tap to dismiss keyboard */}
        <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: Spacing.md, paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.md }}
            >
              <Text style={[Typography.h2, { color: colors.text }]}>วันนี้เป็นยังไงบ้าง?</Text>

              {/* MOODA emoji picker */}
              <MoodaEmojiPicker selectedIndex={emojiIdx} onChange={setEmojiIdx} />

              {/* Text input */}
              <TextInput
                placeholder={`บันทึกความรู้สึก "${current.label}" ของคุณ...`}
                placeholderTextColor={colors.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                style={[
                  styles.textArea,
                  { color: colors.text, backgroundColor: current.bg, borderColor: current.color + '50' },
                ]}
                textAlignVertical="top"
              />

              {/* Tags */}
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>แท็ก</Text>
              <TagCloud tags={PREDEFINED_TAGS} selected={selectedTags} onToggle={toggleTag} />

              <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
                <Button
                  label={`บันทึก ${current.emoji}`}
                  onPress={handleSave}
                  fullWidth
                  size="lg"
                  disabled={!content.trim()}
                />
                <Button label="ยกเลิก" onPress={onClose} variant="ghost" fullWidth />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function JournalScreen() {
  const { colors } = useTheme();
  const { journals, addJournal } = useJournals();
  const [showModal, setShowModal] = useState(false);

  const todayJournal = journals.find((j) => isSameDay(parseISO(j.created_at), new Date()));
  const todayFound = todayJournal
    ? MOOD_OPTIONS.find((_, idx) => toMoodLevel(idx) === (todayJournal.mood as MoodLevel)) ?? MOOD_OPTIONS[5]
    : null;

  return (
    <GradientScreen>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'ios' ? 110 : 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            {/* Page title */}
            <View style={styles.titleRow}>
              <View>
                <Text style={[Typography.h1, { color: colors.text }]}>Journal</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {format(new Date(), 'EEEE, d MMMM yyyy', { locale: th })}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowModal(true)}
                style={[styles.writeBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>เขียน</Text>
              </Pressable>
            </View>

            {/* Today mood card */}
            <View style={[styles.todayCard, Shadow.light, {
              backgroundColor: todayFound ? todayFound.bg : colors.surface,
            }]}>
              {todayFound ? (
                <View style={styles.todayContent}>
                  <Text style={styles.todayEmoji}>{todayFound.emoji}</Text>
                  <View>
                    <Text style={[styles.todayLabel, { color: todayFound.color }]}>
                      {todayFound.label}
                    </Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                      บันทึกวันนี้แล้ว ✓
                    </Text>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.todayEmpty} onPress={() => setShowModal(true)}>
                  <Text style={styles.todayEmptyEmoji}>🫧</Text>
                  <View>
                    <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                      วันนี้คุณรู้สึกอย่างไร?
                    </Text>
                    <Text style={[Typography.caption, { color: colors.primary }]}>
                      แตะเพื่อบันทึก →
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* 30-day calendar */}
            <View style={[styles.calendarCard, Shadow.light, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.md }]}>
                30 วันที่ผ่านมา
              </Text>
              <CalendarView journals={journals} />
            </View>

            {journals.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.text }]}>บันทึกที่ผ่านมา</Text>
            )}
          </View>
        )}
        renderItem={({ item }) => <JournalCard journal={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
              <Edit3 size={32} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[Typography.bodyMedium, { color: colors.text, marginTop: Spacing.md }]}>
              ยังไม่มีบันทึก
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
              กดปุ่ม "เขียน" เพื่อเริ่มต้น
            </Text>
          </View>
        )}
      />

      {/* FAB */}
      <Pressable
        onPress={() => setShowModal(true)}
        style={[styles.fab, Shadow.medium, { backgroundColor: colors.primary }]}
      >
        <Plus size={28} color="#fff" />
      </Pressable>

      <WriteJournalModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={(data) => addJournal(data)}
      />
    </GradientScreen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg },
  header: { gap: Spacing.lg, marginBottom: Spacing.md },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },

  // Today card
  todayCard: { borderRadius: Radius.lg, padding: Spacing.lg },
  todayContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  todayEmoji: { fontSize: 56 },
  todayLabel: { fontSize: 22, fontWeight: '700' },
  todayEmpty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  todayEmptyEmoji: { fontSize: 52 },

  // Calendar
  calendarCard: { borderRadius: Radius.lg, padding: Spacing.lg },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  calendarDay: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  emptyDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },

  // Journal card
  journalCard: { padding: Spacing.md, borderRadius: Radius.md },
  journalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  moodBubble: { width: 52, height: 52, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxxl },
  emptyIcon: { width: 72, height: 72, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },

  // FAB
  fab: {
    position: 'absolute', right: Spacing.xl,
    bottom: Platform.OS === 'ios' ? 108 : 88,
    width: 56, height: 56, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.md, paddingHorizontal: Spacing.xl,
    paddingBottom: 0, maxHeight: '92%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: Radius.full, alignSelf: 'center', marginBottom: Spacing.md },

  // MOODA picker
  moodaCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  moodaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  arrowBtn: {
    width: 40, height: 40,
    borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emojiCircle: {
    width: 84, height: 84,
    alignItems: 'center', justifyContent: 'center',
  },
  bigEmoji: {
    fontSize: 60,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
  },
  gridWrap: {
    width: '100%',
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
  },
  gridCell: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },

  // Text area
  textArea: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 15,
    lineHeight: 24,
  },
});
