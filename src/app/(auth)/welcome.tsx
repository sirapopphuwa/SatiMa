import { useRouter } from 'expo-router';
import { Bell, BookOpen } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BreathingCircle } from '@/components/BreathingCircle';
import { Button } from '@/components/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
}

function WelcomeSlide({ title, subtitle, illustration }: Omit<Slide, 'id'>) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.slide, { width }]}>
      <View style={styles.illustrationContainer}>{illustration}</View>
      <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
        {subtitle}
      </Text>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: Slide[] = [
    {
      id: '1',
      title: 'สวัสดี 👋',
      subtitle: 'SatiMa พร้อมอยู่เคียงข้างคุณทุกวัน',
      illustration: <BreathingCircle size={160} isActive={currentIndex === 0} />,
    },
    {
      id: '2',
      title: 'เตือนสติให้ตัวเองทุกวัน',
      subtitle: 'ตั้งระฆังเตือนให้หยุดพักและหายใจ ในทุกช่วงเวลาที่คุณต้องการ',
      illustration: (
        <View style={[styles.iconBg, { backgroundColor: colors.secondary + '20' }]}>
          <Bell size={72} color={colors.secondary} strokeWidth={1.5} />
        </View>
      ),
    },
    {
      id: '3',
      title: 'บันทึกความรู้สึก ดูแลใจตัวเอง',
      subtitle: 'จดบันทึกอารมณ์และความรู้สึก เพื่อทำความเข้าใจตัวเองมากขึ้น',
      illustration: (
        <View style={[styles.iconBg, { backgroundColor: colors.accent + '20' }]}>
          <BookOpen size={72} color={colors.accent} strokeWidth={1.5} />
        </View>
      ),
    },
  ];

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setCurrentIndex(viewableItems[0].index);
  });

  function goNext() {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ปุ่ม Skip */}
      <Pressable
        onPress={() => router.replace('/(auth)/login')}
        style={styles.skipBtn}
      >
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>ข้าม</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <WelcomeSlide title={item.title} subtitle={item.subtitle} illustration={item.illustration} />
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? colors.primary : colors.border,
                width: i === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.btnContainer}>
        <Button
          label={currentIndex === slides.length - 1 ? 'เริ่มเลย' : 'ถัดไป'}
          onPress={goNext}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  illustrationContainer: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 180,
    height: 180,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: Radius.full,
  },
  btnContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
