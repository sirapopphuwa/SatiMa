import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

type CardVariant = 'default' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, variant = 'default', style, padding = 16 }: CardProps) {
  const { colors, heroGradient } = useTheme();

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, { padding, borderRadius: Radius.lg }, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.shadow, Shadow.light, { borderRadius: Radius.lg }, style]}>
      <View
        style={[
          styles.inner,
          { backgroundColor: colors.surface, padding, borderRadius: Radius.lg },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // Shadow lives here so overflow:visible works on iOS
  },
  inner: {
    overflow: 'hidden',
  },
  base: {
    overflow: 'hidden',
  },
});
