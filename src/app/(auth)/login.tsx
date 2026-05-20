import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[Typography.h1, { color: colors.text }]}>ยินดีต้อนรับกลับ 🙏</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              เข้าสู่ระบบเพื่อดูแลใจของคุณต่อ
            </Text>
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <Button
              label="เข้าสู่ระบบด้วย Apple"
              onPress={() => {}}
              variant="secondary"
              fullWidth
              size="lg"
              style={{ backgroundColor: colors.text, borderColor: colors.text }}
              icon={<Text style={{ color: colors.background, fontSize: 18 }}></Text>}
            />
            <Button
              label="เข้าสู่ระบบด้วย Google"
              onPress={() => {}}
              variant="secondary"
              fullWidth
              size="lg"
              icon={<Text style={{ fontSize: 18 }}>G</Text>}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[Typography.caption, { color: colors.textSecondary, paddingHorizontal: Spacing.md }]}>
              หรือเข้าด้วย email
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Email Input */}
          <View style={styles.inputSection}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                placeholder="อีเมลของคุณ"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                placeholder="รหัสผ่านของคุณ"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text, flex: 1 }]}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={18} color={colors.textSecondary} />
                  : <Eye size={18} color={colors.textSecondary} />
                }
              </Pressable>
            </View>

            {error ? (
              <Text style={[Typography.caption, { color: colors.error }]}>{error}</Text>
            ) : null}
          </View>

          {/* Login Button */}
          <Button
            label="เข้าสู่ระบบ"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>ยังไม่มีบัญชี? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={[Typography.bodyMedium, { color: colors.primary }]}>สมัครสมาชิก</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginTop: Spacing.xl,
  },
  socialSection: {
    gap: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  inputSection: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
});
