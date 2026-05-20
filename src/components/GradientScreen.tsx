import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
  edges?: Edge[];
}

/**
 * Replaces the common <SafeAreaView style={{ backgroundColor: colors.background }}>
 * pattern with a full-screen gradient that matches the accent theme.
 */
export function GradientScreen({ children, edges = ['top'] }: Props) {
  const { backgroundGradient } = useTheme();

  return (
    <LinearGradient
      colors={backgroundGradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
