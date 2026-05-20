import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, User } from 'lucide-react-native';
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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name || !email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await signUpWithEmail(email.trim(), password, name.trim());
    setLoading(false);
    if (authError) {
      setError(authError.includes('already') ? 'อีเมลนี้ถูกใช้แล้ว' : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[Typography.h1, { color: colors.text }]}>สร้างบัญชีใหม่ ✨</Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              เริ่มต้นดูแลใจตัวเองวันนี้
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <User size={18} color={colors.textSecondary} />
              <TextInput
                placeholder="ชื่อของคุณ"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: colors.text }]}
              />
            </View>

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
                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
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

            {error ? <Text style={[Typography.caption, { color: colors.error }]}>{error}</Text> : null}
          </View>

          <Button label="สมัครสมาชิก" onPress={handleRegister} loading={loading} fullWidth size="lg" />

          <View style={styles.loginRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>มีบัญชีแล้ว? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[Typography.bodyMedium, { color: colors.primary }]}>เข้าสู่ระบบ</Text>
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
  header: { marginTop: Spacing.xl },
  inputSection: { gap: Spacing.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  input: { flex: 1, fontSize: 16 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
});
