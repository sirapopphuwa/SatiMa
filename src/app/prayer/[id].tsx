import { AVPlaybackStatus, Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ProgressBar } from '@/components/ProgressBar';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { PRAYERS } from '@/data/prayers';

const { height } = Dimensions.get('window');

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function PrayerPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const prayer = PRAYERS.find((p) => p.id === id);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoop, setIsLoop] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [showMeaning, setShowMeaning] = useState(false);

  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 400 });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [bgOpacity]);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish && !status.isLooping) setIsPlaying(false);
  }, []);

  async function loadAndPlay() {
    if (!prayer?.audio_file) return;
    setIsLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: prayer.audio_file },
        { shouldPlay: true, isLooping: isLoop, rate: SPEEDS[speedIndex] },
        onPlaybackStatusUpdate,
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePlay() {
    if (!soundRef.current) {
      await loadAndPlay();
      return;
    }
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  async function seekTo(ratio: number) {
    if (!soundRef.current || !duration) return;
    await soundRef.current.setPositionAsync(Math.floor(ratio * duration));
  }

  async function toggleLoop() {
    const next = !isLoop;
    setIsLoop(next);
    await soundRef.current?.setIsLoopingAsync(next);
  }

  async function cycleSpeed() {
    const nextIdx = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIdx);
    await soundRef.current?.setRateAsync(SPEEDS[nextIdx], true);
  }

  async function restart() {
    await soundRef.current?.setPositionAsync(0);
    await soundRef.current?.playAsync();
  }

  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  if (!prayer) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>ไม่พบบทสวด</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, bgStyle, { backgroundColor: isDark ? '#1A1625' : '#2E2B4A' }]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <X size={24} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Text style={[Typography.bodyMedium, { color: 'rgba(255,255,255,0.9)', flex: 1, textAlign: 'center' }]}>
            {prayer.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Lotus illustration */}
        <View style={styles.lotusContainer}>
          <Text style={{ fontSize: 96 }}>🪷</Text>
        </View>

        {/* Prayer content */}
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.prayerText, { color: 'rgba(255,255,255,0.95)' }]}>
            {prayer.content}
          </Text>

          {/* Meaning toggle */}
          <Pressable
            onPress={() => setShowMeaning(!showMeaning)}
            style={[styles.meaningToggle, { borderColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>ความหมาย</Text>
            {showMeaning
              ? <ChevronUp size={16} color="rgba(255,255,255,0.7)" />
              : <ChevronDown size={16} color="rgba(255,255,255,0.7)" />
            }
          </Pressable>

          {showMeaning && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text style={[Typography.body, { color: 'rgba(255,255,255,0.75)', lineHeight: 26 }]}>
                {prayer.meaning}
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Player bar */}
        <View style={styles.playerBar}>
          {/* Progress */}
          {duration > 0 && (
            <View style={styles.progressSection}>
              <Pressable
                onPress={(e) => {
                  const ratio = e.nativeEvent.locationX / (Dimensions.get('window').width - Spacing.xl * 2);
                  seekTo(ratio);
                }}
                style={styles.progressHitArea}
              >
                <ProgressBar
                  progress={duration > 0 ? position / duration : 0}
                  height={3}
                  color="rgba(255,255,255,0.8)"
                />
              </Pressable>
              <View style={styles.timeRow}>
                <Text style={[Typography.small, { color: 'rgba(255,255,255,0.6)' }]}>{formatTime(position)}</Text>
                <Text style={[Typography.small, { color: 'rgba(255,255,255,0.6)' }]}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}

          {!prayer.audio_file && (
            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: Spacing.md }]}>
              ไม่มีไฟล์เสียง — กำลังพัฒนา
            </Text>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            {/* Loop */}
            <Pressable onPress={toggleLoop} style={styles.controlBtn} hitSlop={12}>
              <RefreshCw size={20} color={isLoop ? 'white' : 'rgba(255,255,255,0.4)'} />
            </Pressable>

            {/* Restart */}
            <Pressable onPress={restart} style={styles.controlBtn} hitSlop={12}>
              <RotateCcw size={22} color="rgba(255,255,255,0.7)" />
            </Pressable>

            {/* Play/Pause */}
            <Pressable
              onPress={togglePlay}
              disabled={!prayer.audio_file || isLoading}
              style={[styles.playBtn, { backgroundColor: prayer.audio_file ? 'white' : 'rgba(255,255,255,0.3)' }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#2E2B4A" />
              ) : isPlaying ? (
                <Pause size={28} color="#2E2B4A" fill="#2E2B4A" />
              ) : (
                <Play size={28} color="#2E2B4A" fill="#2E2B4A" />
              )}
            </Pressable>

            {/* Speed */}
            <Pressable onPress={cycleSpeed} style={styles.controlBtn} hitSlop={12}>
              <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)', fontWeight: '700' }]}>
                {SPEEDS[speedIndex]}x
              </Text>
            </Pressable>

            <View style={{ width: 36 }} />
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  lotusContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  contentInner: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  prayerText: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'center',
  },
  meaningToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  playerBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    gap: Spacing.md,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressHitArea: {
    paddingVertical: Spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  controlBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
