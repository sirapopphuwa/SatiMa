import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clock, Edit2, Plus, Repeat, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { GradientScreen } from '@/components/GradientScreen';
import { Button } from '@/components/Button';
import { Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useBellAlarms } from '@/hooks/useBellAlarms';
import { countRingsPerDay, useIntervalBell } from '@/hooks/useIntervalBell';
import { BellAlarm, IntervalBell, SOUND_TYPE_LABELS, SoundType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const INTERVAL_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5 นาที' },
  { value: 10, label: '10 นาที' },
  { value: 15, label: '15 นาที' },
  { value: 20, label: '20 นาที' },
  { value: 30, label: '30 นาที' },
  { value: 45, label: '45 นาที' },
  { value: 60, label: '1 ชม.' },
  { value: 90, label: '1.5 ชม.' },
  { value: 120, label: '2 ชม.' },
];

const TIME_PRESETS = [
  { id: 'morning', icon: '🌅', label: 'ช่วงเช้า', startH: 6, endH: 12 },
  { id: 'daytime', icon: '☀️', label: 'กลางวัน', startH: 9, endH: 17 },
  { id: 'evening', icon: '🌇', label: 'ช่วงเย็น', startH: 15, endH: 21 },
  { id: 'allday', icon: '🌞', label: 'ทั้งวัน', startH: 7, endH: 22 },
] as const;

type PresetId = typeof TIME_PRESETS[number]['id'] | 'custom';

function getInitialPreset(startTime: string, endTime: string): PresetId {
  const sh = parseInt(startTime.split(':')[0], 10);
  const eh = parseInt(endTime.split(':')[0], 10);
  const match = TIME_PRESETS.find((p) => p.startH === sh && p.endH === eh);
  return match ? match.id : 'custom';
}

// Hour range available for custom picker (05:00 – 23:00)
const CUSTOM_HOURS = Array.from({ length: 19 }, (_, i) => i + 5);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Interval Bell Modal ──────────────────────────────────────────────────────

function IntervalBellModal({
  visible,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  initial: IntervalBell | null;
  onClose: () => void;
  onSave: (data: IntervalBell) => void;
  onDelete?: () => void;
}) {
  const { colors } = useTheme();
  const [intervalMin, setIntervalMin] = useState(initial?.interval_minutes ?? 30);
  const [presetId, setPresetId] = useState<PresetId>('allday');
  const [startH, setStartH] = useState(7);
  const [endH, setEndH] = useState(22);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (!visible) return;
    const sh = parseInt(initial?.start_time?.split(':')[0] ?? '7', 10);
    const eh = parseInt(initial?.end_time?.split(':')[0] ?? '22', 10);
    setIntervalMin(initial?.interval_minutes ?? 30);
    setStartH(sh);
    setEndH(eh);
    setPresetId(
      initial
        ? getInitialPreset(initial.start_time, initial.end_time)
        : 'allday',
    );
  }, [visible, initial]);

  const startTime = `${String(startH).padStart(2, '0')}:00`;
  const endTime = `${String(endH).padStart(2, '0')}:00`;
  const ringCount = useMemo(
    () => countRingsPerDay(intervalMin, startTime, endTime),
    [intervalMin, startTime, endTime],
  );

  function selectPreset(p: typeof TIME_PRESETS[number]) {
    setPresetId(p.id);
    setStartH(p.startH);
    setEndH(p.endH);
  }

  function handleSave() {
    if (endH <= startH) {
      Alert.alert('เวลาไม่ถูกต้อง', 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }
    onSave({
      id: initial?.id ?? `ibv_${Date.now()}`,
      interval_minutes: intervalMin,
      start_time: startTime,
      end_time: endTime,
      is_active: initial?.is_active ?? true,
      sound_type: initial?.sound_type ?? 'bell',
    });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.lg }}
          >
            {/* ── Title ──────────────────────────────────────────────────── */}
            <View style={styles.modalTitleRow}>
              <Text style={[Typography.h2, { color: colors.text }]}>ระฆังช่วงเวลา ⏱️</Text>
              {onDelete && (
                <Pressable
                  onPress={() => { onDelete(); onClose(); }}
                  style={[styles.deleteBtnSm, { backgroundColor: '#FF5C5C15' }]}
                >
                  <Trash2 size={15} color="#FF5C5C" />
                </Pressable>
              )}
            </View>

            {/* ── Interval selector ──────────────────────────────────────── */}
            <View>
              <Text style={[Typography.bodyMedium, { color: colors.text, marginBottom: Spacing.sm }]}>
                ดังทุก
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.intervalRow}
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setIntervalMin(opt.value)}
                    style={[
                      styles.intervalChip,
                      {
                        backgroundColor: intervalMin === opt.value ? colors.primary : colors.background,
                        borderColor: intervalMin === opt.value ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[
                      Typography.caption,
                      { color: intervalMin === opt.value ? '#fff' : colors.textSecondary, fontWeight: '700' },
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* ── Time window ────────────────────────────────────────────── */}
            <View>
              <Text style={[Typography.bodyMedium, { color: colors.text, marginBottom: Spacing.sm }]}>
                ช่วงเวลาที่ต้องการเตือน
              </Text>

              {/* 2×2 preset grid */}
              <View style={styles.presetGrid}>
                {TIME_PRESETS.map((p) => {
                  const active = presetId === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => selectPreset(p)}
                      style={[
                        styles.presetCard,
                        {
                          backgroundColor: active ? colors.primary : colors.background,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                      <Text style={[
                        Typography.bodyMedium,
                        { color: active ? '#fff' : colors.text, fontWeight: '700' },
                      ]}>
                        {p.label}
                      </Text>
                      <Text style={[
                        Typography.small,
                        { color: active ? 'rgba(255,255,255,0.85)' : colors.textSecondary },
                      ]}>
                        {String(p.startH).padStart(2, '0')}:00 – {String(p.endH).padStart(2, '0')}:00
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom option */}
              <Pressable
                onPress={() => setPresetId('custom')}
                style={[
                  styles.customToggle,
                  {
                    borderColor: presetId === 'custom' ? colors.primary : colors.border,
                    backgroundColor: presetId === 'custom' ? colors.primary + '10' : colors.background,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>⚙️</Text>
                <Text style={[
                  Typography.bodyMedium,
                  { color: presetId === 'custom' ? colors.primary : colors.textSecondary, fontWeight: '600' },
                ]}>
                  กำหนดเอง
                </Text>
              </Pressable>

              {/* Custom hour chips — only when 'custom' is selected */}
              {presetId === 'custom' && (
                <View style={[styles.customPickers, { backgroundColor: colors.background }]}>
                  {/* Start hour */}
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 6, fontWeight: '600' }]}>
                    🕐 เริ่มเวลา
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: Spacing.xs, paddingBottom: Spacing.sm }}
                  >
                    {CUSTOM_HOURS.map((h) => {
                      const active = startH === h;
                      return (
                        <Pressable
                          key={h}
                          onPress={() => { setStartH(h); if (endH <= h) setEndH(h + 1); }}
                          style={[
                            styles.hourChip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={[
                            Typography.caption,
                            { color: active ? '#fff' : colors.text, fontWeight: '700' },
                          ]}>
                            {String(h).padStart(2, '0')}:00
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* End hour */}
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 6, fontWeight: '600' }]}>
                    🕙 สิ้นสุดเวลา
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: Spacing.xs }}
                  >
                    {CUSTOM_HOURS.filter((h) => h > startH).map((h) => {
                      const active = endH === h;
                      return (
                        <Pressable
                          key={h}
                          onPress={() => setEndH(h)}
                          style={[
                            styles.hourChip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={[
                            Typography.caption,
                            { color: active ? '#fff' : colors.text, fontWeight: '700' },
                          ]}>
                            {String(h).padStart(2, '0')}:00
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* ── Preview ────────────────────────────────────────────────── */}
            <View style={[
              styles.previewCard,
              { backgroundColor: ringCount > 0 ? colors.primary + '12' : colors.background },
            ]}>
              <Repeat size={18} color={ringCount > 0 ? colors.primary : colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  Typography.bodyMedium,
                  { color: ringCount > 0 ? colors.primary : colors.textSecondary },
                ]}>
                  {ringCount > 0 ? `วันนี้จะดัง ${ringCount} ครั้ง` : 'เวลาไม่ถูกต้อง'}
                </Text>
                {ringCount > 0 && (
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    {startTime} – {endTime} · ทุก {intervalMin} นาที
                  </Text>
                )}
              </View>
            </View>

            <Button label="บันทึก ✓" onPress={handleSave} fullWidth size="lg" disabled={ringCount === 0} />
            <Button label="ยกเลิก" onPress={onClose} variant="ghost" fullWidth size="md" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Interval Bell Card ───────────────────────────────────────────────────────

function IntervalBellCard({
  bell,
  onToggle,
  onEdit,
  onAdd,
}: {
  bell: IntervalBell | null;
  onToggle: () => void;
  onEdit: () => void;
  onAdd: () => void;
}) {
  const { colors } = useTheme();

  const ringCount = bell
    ? countRingsPerDay(bell.interval_minutes, bell.start_time, bell.end_time)
    : 0;

  return (
    <View style={[styles.intervalCard, Shadow.light, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.intervalHeader}>
        <View style={[styles.intervalIconWrap, { backgroundColor: colors.secondary + '20' }]}>
          <Clock size={18} color={colors.secondary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>ระฆังช่วงเวลา</Text>
        {bell && (
          <Switch
            value={bell.is_active}
            onValueChange={onToggle}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        )}
      </View>

      {bell ? (
        /* Configured state */
        <View style={styles.intervalBody}>
          <View style={[styles.intervalDivider, { backgroundColor: colors.border }]} />

          {/* Stats row */}
          <View style={styles.intervalStats}>
            {/* Interval */}
            <View style={[styles.intervalStat, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.intervalStatValue, { color: colors.primary }]}>
                {bell.interval_minutes < 60
                  ? `${bell.interval_minutes} นาที`
                  : `${bell.interval_minutes / 60} ชม.`}
              </Text>
              <Text style={[Typography.small, { color: colors.textSecondary }]}>ช่วงห่าง</Text>
            </View>
            {/* Window */}
            <View style={[styles.intervalStat, { backgroundColor: colors.secondary + '10' }]}>
              <Text style={[styles.intervalStatValue, { color: colors.secondary }]}>
                {bell.start_time} – {bell.end_time}
              </Text>
              <Text style={[Typography.small, { color: colors.textSecondary }]}>ช่วงเวลา</Text>
            </View>
            {/* Count */}
            <View style={[styles.intervalStat, { backgroundColor: '#72E2A020' }]}>
              <Text style={[styles.intervalStatValue, { color: '#34C37A' }]}>{ringCount}</Text>
              <Text style={[Typography.small, { color: colors.textSecondary }]}>ครั้ง/วัน</Text>
            </View>
          </View>

          {/* Active label + edit */}
          <View style={styles.intervalFooter}>
            <View style={[
              styles.statusPill,
              { backgroundColor: bell.is_active ? '#34C37A20' : colors.border + '50' },
            ]}>
              <View style={[styles.statusDot, { backgroundColor: bell.is_active ? '#34C37A' : colors.textSecondary }]} />
              <Text style={[Typography.small, { color: bell.is_active ? '#34C37A' : colors.textSecondary, fontWeight: '600' }]}>
                {bell.is_active ? 'เปิดใช้งาน' : 'ปิดอยู่'}
              </Text>
            </View>
            <Pressable
              onPress={onEdit}
              style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
            >
              <Edit2 size={13} color={colors.primary} />
              <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>แก้ไข</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* Empty state */
        <Pressable onPress={onAdd} style={styles.intervalEmpty}>
          <View style={[styles.addCircle, { backgroundColor: colors.primary + '15' }]}>
            <Plus size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[Typography.bodyMedium, { color: colors.text }]}>ตั้งระฆังช่วงเวลา</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              เตือนสติทุก 5–120 นาที ตามช่วงเวลาที่กำหนด
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

// ─── Fixed Alarm Card ─────────────────────────────────────────────────────────

function AlarmCard({
  alarm,
  onToggle,
  onDelete,
}: {
  alarm: BellAlarm;
  onToggle: () => void;
  onDelete: () => void;
  isPremium: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.alarmCard, Shadow.light, { backgroundColor: colors.surface }]}>
      <View style={styles.alarmRow}>
        <View style={[styles.alarmIconWrap, { backgroundColor: colors.primary + '15' }]}>
          <Bell size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.alarmTime, { color: colors.text }]}>{alarm.time}</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {SOUND_TYPE_LABELS[alarm.sound_type]}
            {alarm.repeat_days.length > 0 && ` · ${alarm.repeat_days.map((d) => DAY_LABELS[d]).join(' ')}`}
          </Text>
        </View>
        <View style={styles.alarmActions}>
          <Pressable
            onPress={onDelete}
            hitSlop={12}
            style={[styles.deleteBtn, { backgroundColor: '#FF5C5C15' }]}
          >
            <Trash2 size={14} color="#FF5C5C" />
          </Pressable>
          <Switch
            value={alarm.is_active}
            onValueChange={onToggle}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </View>
  );
}

// ─── Add Fixed Alarm Modal ────────────────────────────────────────────────────

function AddAlarmModal({
  visible,
  onClose,
  onAdd,
  isPremium,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (alarm: Omit<BellAlarm, 'id' | 'user_id'>) => void;
  isPremium: boolean;
}) {
  const { colors } = useTheme();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [soundType, setSoundType] = useState<SoundType>('bell');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const soundOptions: { type: SoundType; label: string; isPremiumOnly: boolean }[] = [
    { type: 'bell', label: '🔔 เสียงระฆัง', isPremiumOnly: false },
    { type: 'nature', label: '🌊 ธรรมชาติ', isPremiumOnly: true },
    { type: 'vibration', label: '📳 สั่น', isPremiumOnly: true },
  ];

  function toggleDay(d: number) {
    setRepeatDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  function handleAdd() {
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onAdd({ time, sound_type: soundType, is_active: true, repeat_days: repeatDays });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          <Text style={[Typography.h2, { color: colors.text, marginBottom: Spacing.lg }]}>
            ตั้งระฆังใหม่ 🔔
          </Text>

          {/* Time Picker */}
          <View style={[styles.timePickerWrap, { backgroundColor: colors.background }]}>
            <View style={styles.timePicker}>
              <View style={styles.timeColumn}>
                <Pressable onPress={() => setHour((h) => (h + 1) % 24)}>
                  <Text style={[styles.timeArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.timeValue, { color: colors.text }]}>{String(hour).padStart(2, '0')}</Text>
                <Pressable onPress={() => setHour((h) => (h - 1 + 24) % 24)}>
                  <Text style={[styles.timeArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>
              <Text style={[styles.timeColon, { color: colors.primary }]}>:</Text>
              <View style={styles.timeColumn}>
                <Pressable onPress={() => setMinute((m) => (m + 5) % 60)}>
                  <Text style={[styles.timeArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.timeValue, { color: colors.text }]}>{String(minute).padStart(2, '0')}</Text>
                <Pressable onPress={() => setMinute((m) => (m - 5 + 60) % 60)}>
                  <Text style={[styles.timeArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Sound Type */}
          <Text style={[Typography.bodyMedium, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            เสียงแจ้งเตือน
          </Text>
          <View style={styles.soundOptions}>
            {soundOptions.map((opt) => (
              <Pressable
                key={opt.type}
                onPress={() => isPremium || !opt.isPremiumOnly ? setSoundType(opt.type) : null}
                style={[
                  styles.soundOption,
                  {
                    backgroundColor: soundType === opt.type ? colors.primary : colors.background,
                    opacity: (!isPremium && opt.isPremiumOnly) ? 0.4 : 1,
                  },
                ]}
              >
                <Text style={[Typography.caption, { color: soundType === opt.type ? '#fff' : colors.textSecondary, fontWeight: '600' }]}>
                  {opt.label}{opt.isPremiumOnly && !isPremium ? ' 🔒' : ''}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Repeat Days */}
          <Text style={[Typography.bodyMedium, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            ซ้ำทุกวัน
          </Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((label, i) => (
              <Pressable
                key={i}
                onPress={() => toggleDay(i)}
                style={[
                  styles.dayBtn,
                  {
                    backgroundColor: repeatDays.includes(i) ? colors.primary : colors.background,
                    borderColor: repeatDays.includes(i) ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[Typography.small, { color: repeatDays.includes(i) ? '#fff' : colors.textSecondary, fontWeight: '600' }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button label="เพิ่มระฆัง" onPress={handleAdd} fullWidth size="lg" style={{ marginTop: Spacing.xl }} />
          <Button label="ยกเลิก" onPress={onClose} variant="ghost" fullWidth size="md" />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BellScreen() {
  const { colors, heroGradient } = useTheme();
  const { alarms, isPremium, addAlarm, toggleAlarm, deleteAlarm } = useBellAlarms();
  const { bell, save: saveInterval, toggle: toggleInterval, remove: removeInterval } = useIntervalBell();
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showIntervalModal, setShowIntervalModal] = useState(false);

  React.useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        Alert.alert('แจ้งเตือน', 'กรุณาอนุญาตการแจ้งเตือนเพื่อใช้งานระฆังเตือนสติ');
      }
    });
  }, []);

  async function handleAddAlarm(data: Omit<BellAlarm, 'id' | 'user_id'>) {
    const error = await addAlarm(data);
    if (error) Alert.alert('ฟีเจอร์ Premium', error);
  }

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === 'ios' ? 110 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroRow}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }}>
                ตั้งเวลาเตือนสติ
              </Text>
              <Text style={styles.heroTitle}>ระฆังเตือนสติ 🔔</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }}>
                หยุดพักและหายใจลึกๆ สักครู่
              </Text>
            </View>
            <View style={styles.heroBellWrap}>
              <Bell size={36} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          {/* Breath guide */}
          <View style={styles.breathRow}>
            {['หายใจเข้า', 'กลั้น', 'หายใจออก'].map((s, i) => (
              <View key={i} style={styles.breathItem}>
                <View style={[styles.breathDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{s}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Interval Bell Section ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ระฆังช่วงเวลา</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
            เตือนซ้ำทุก X นาที ภายในช่วงที่กำหนด
          </Text>
          <IntervalBellCard
            bell={bell}
            onToggle={toggleInterval}
            onEdit={() => setShowIntervalModal(true)}
            onAdd={() => setShowIntervalModal(true)}
          />
        </View>

        {/* ── Fixed Alarms Section ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.alarmsHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>ระฆังแบบกำหนดเวลา</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>ดังตามเวลาที่ตั้งไว้</Text>
            </View>
            {!isPremium && (
              <View style={[styles.limitBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {alarms.filter((a) => a.is_active).length}/2 ฟรี
                </Text>
              </View>
            )}
          </View>

          {alarms.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
                <Bell size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[Typography.bodyMedium, { color: colors.text, marginTop: Spacing.md }]}>
                ยังไม่มีระฆัง
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                กดปุ่ม + เพื่อตั้งเวลาเตือนสติ
              </Text>
            </View>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={() => toggleAlarm(alarm.id)}
                  onDelete={() => deleteAlarm(alarm.id)}
                  isPremium={isPremium}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB — add fixed alarm */}
      <Pressable
        onPress={() => setShowAlarmModal(true)}
        style={[styles.fab, Shadow.medium, { backgroundColor: colors.primary }]}
      >
        <Plus size={28} color="#fff" />
      </Pressable>

      {/* Modals */}
      <IntervalBellModal
        visible={showIntervalModal}
        initial={bell}
        onClose={() => setShowIntervalModal(false)}
        onSave={saveInterval}
        onDelete={bell ? removeInterval : undefined}
      />
      <AddAlarmModal
        visible={showAlarmModal}
        onClose={() => setShowAlarmModal(false)}
        onAdd={handleAddAlarm}
        isPremium={isPremium}
      />
    </GradientScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },

  // Hero
  heroCard: {
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 4 },
  heroBellWrap: {
    width: 64, height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  breathRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.md,
  },
  breathItem: { alignItems: 'center', gap: 6 },
  breathDot: { width: 28, height: 6, borderRadius: Radius.full },

  // Sections
  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 17, fontWeight: '700' },

  // Interval Bell Card
  intervalCard: { borderRadius: Radius.lg, padding: Spacing.md },
  intervalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  intervalIconWrap: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  intervalBody: { gap: Spacing.sm },
  intervalDivider: { height: 1, marginVertical: Spacing.xs },
  intervalStats: { flexDirection: 'row', gap: Spacing.sm },
  intervalStat: {
    flex: 1, alignItems: 'center', gap: 3,
    padding: Spacing.sm, borderRadius: Radius.sm,
  },
  intervalStatValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  intervalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full,
  },
  intervalEmpty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.sm },
  addCircle: {
    width: 44, height: 44, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  // Alarms header / empty
  alarmsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  limitBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  alarmCard: { padding: Spacing.md, borderRadius: Radius.md },
  alarmRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alarmIconWrap: {
    width: 40, height: 40, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  alarmTime: { fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  alarmActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deleteBtn: {
    width: 32, height: 32, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xxxl, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radius.lg,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute', right: Spacing.xl,
    bottom: Platform.OS === 'ios' ? 108 : 88,
    width: 56, height: 56, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  // Modal shared
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.md, paddingHorizontal: Spacing.xl,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: Radius.full,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deleteBtnSm: {
    width: 34, height: 34, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },

  // Interval modal
  intervalRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  intervalChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1.5,
  },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.md,
  },

  // Preset grid
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  presetCard: {
    width: '47%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 4,
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  customPickers: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  hourChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },

  // Add alarm modal
  timePickerWrap: { borderRadius: Radius.md, padding: Spacing.md },
  timePicker: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.xl, paddingVertical: Spacing.sm,
  },
  timeColumn: { alignItems: 'center', gap: Spacing.sm },
  timeArrow: { fontSize: 20, fontWeight: '700' },
  timeValue: { fontSize: 48, fontWeight: '700', letterSpacing: 2 },
  timeColon: { fontSize: 48, fontWeight: '300', marginBottom: 8 },
  soundOptions: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  soundOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  daysRow: { flexDirection: 'row', gap: Spacing.sm },
  dayBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
});
