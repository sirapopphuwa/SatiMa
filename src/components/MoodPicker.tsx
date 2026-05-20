import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { MoodColors, MoodEmojis, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { MoodLevel } from '@/types';

interface MoodPickerProps {
  selected?: MoodLevel;
  onSelect: (mood: MoodLevel) => void;
}

const MOODS: MoodLevel[] = [1, 2, 3, 4, 5];

function MoodButton({ level, selected, onSelect }: { level: MoodLevel; selected: boolean; onSelect: (m: MoodLevel) => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(1.25, { duration: 150 }),
      withSpring(1, { duration: 150 }),
    );
    onSelect(level);
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} style={styles.moodBtn}>
        <View
          style={[
            styles.circle,
            {
              backgroundColor: selected ? MoodColors[level] + '30' : 'transparent',
              borderColor: selected ? MoodColors[level] : colors.border,
              borderWidth: selected ? 2 : 1,
            },
          ]}
        >
          <Text style={[styles.emoji, selected && styles.emojiSelected]}>
            {MoodEmojis[level]}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  return (
    <View style={styles.row}>
      {MOODS.map((level) => (
        <MoodButton
          key={level}
          level={level}
          selected={selected === level}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  moodBtn: {
    alignItems: 'center',
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  emojiSelected: {
    fontSize: 28,
  },
});
