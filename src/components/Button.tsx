import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Gradients, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'premium';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withTiming(0.96, { duration: 100 });
  }
  function handlePressOut() {
    scale.value = withTiming(1, { duration: 100 });
  }

  const sizeStyles = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, height: 36 },
    md: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, height: 48 },
    lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, height: 56 },
  }[size];

  const textSizes = { sm: 13, md: 15, lg: 17 }[size];

  if (variant === 'premium') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={Gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles, styles.row, { borderRadius: Radius.full, opacity: disabled ? 0.5 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.premiumText, { fontSize: textSizes }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const bgColor = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: 'transparent',
    premium: 'transparent',
  }[variant];

  const textColor = {
    primary: '#fff',
    secondary: colors.primary,
    ghost: colors.primary,
    premium: '#fff',
  }[variant];

  const borderColor = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.base,
        styles.row,
        sizeStyles,
        {
          backgroundColor: bgColor,
          borderRadius: Radius.full,
          borderColor,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[Typography.bodyMedium, { color: textColor, fontSize: textSizes }]}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  premiumText: {
    color: '#fff',
    fontWeight: '600',
  },
});
