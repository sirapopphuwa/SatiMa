import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface BreathingCircleProps {
  size?: number;
  isActive?: boolean;
}

export function BreathingCircle({ size = 200, isActive = true }: BreathingCircleProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const INHALE = 4000;
  const HOLD = 2000;
  const EXHALE = 4000;

  const cycleBreathing = useCallback(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: INHALE }),
        withDelay(HOLD, withTiming(1, { duration: EXHALE })),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: INHALE }),
        withDelay(HOLD, withTiming(0.4, { duration: EXHALE })),
      ),
      -1,
      false,
    );
  }, [scale, opacity]);

  useEffect(() => {
    if (!isActive) {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.4, { duration: 300 });
      return;
    }
    cycleBreathing();

    // สลับ label ตาม phase
    const interval = setInterval(() => {
      setPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, INHALE);

    return () => clearInterval(interval);
  }, [isActive, cycleBreathing, scale, opacity]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const phaseLabel = { inhale: 'หายใจเข้า...', hold: 'กลั้นหายใจ...', exhale: 'หายใจออก...' }[phase];

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {/* วงกลมชั้นนอก glow */}
      <Animated.View
        style={[
          styles.glow,
          animatedCircleStyle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            backgroundColor: colors.secondary + '25',
          },
        ]}
      />
      {/* วงกลมกลาง */}
      <Animated.View
        style={[
          styles.circle,
          animatedCircleStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.secondary + '50',
            borderColor: colors.secondary,
            borderWidth: 2,
          },
        ]}
      />
      {/* label */}
      {isActive && (
        <View style={styles.labelContainer}>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>{phaseLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    bottom: Spacing.xs,
    alignItems: 'center',
  },
});
