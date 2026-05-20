import { Tabs } from 'expo-router';
import { Bell, BookOpen, Flower2, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Font, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[
      styles.tabIcon,
      focused && { backgroundColor: colors.primary + '25' },
    ]}>
      {icon}
    </View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 92 : 74,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          paddingHorizontal: 4,
          ...Shadow.soft,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: Font.semibold,
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: { borderRadius: Radius.sm },
      }}
    >
      <Tabs.Screen
        name="prayer/index"
        options={{
          title: 'สวดมนต์',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={
              <Flower2 size={21} color={color} strokeWidth={focused ? 2.5 : 1.5} />
            } />
          ),
        }}
      />
      <Tabs.Screen
        name="bell/index"
        options={{
          title: 'ระฆัง',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={
              <Bell size={21} color={color} strokeWidth={focused ? 2.5 : 1.5} />
            } />
          ),
        }}
      />
      <Tabs.Screen
        name="journal/index"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={
              <BookOpen size={21} color={color} strokeWidth={focused ? 2.5 : 1.5} />
            } />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={
              <User size={21} color={color} strokeWidth={focused ? 2.5 : 1.5} />
            } />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
