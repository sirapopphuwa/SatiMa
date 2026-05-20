import { X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}

export function TagChip({ label, selected = false, onPress, onRemove }: TagChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withTiming(0.96, { duration: 80 });
    setTimeout(() => { scale.value = withTiming(1, { duration: 80 }); }, 80);
    onPress?.();
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.primary + '20' : colors.surface,
            borderColor: selected ? colors.primary : colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text
          style={[
            Typography.caption,
            { color: selected ? colors.primary : colors.textSecondary, fontWeight: selected ? '600' : '400' },
          ]}
        >
          {label}
        </Text>
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={8}>
            <X size={12} color={colors.textSecondary} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

interface TagCloudProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagCloud({ tags, selected, onToggle }: TagCloudProps) {
  return (
    <View style={styles.cloud}>
      {tags.map((tag) => (
        <TagChip
          key={tag}
          label={tag}
          selected={selected.includes(tag)}
          onPress={() => onToggle(tag)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
