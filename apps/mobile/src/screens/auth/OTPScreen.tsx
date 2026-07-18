import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const BRAND = {
  green: '#007A52',
  navy: '#0D2B5E',
  orange: '#F56500',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
};

const OTP_LENGTH = 6;

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ route, navigation }: Props) {
  const { phoneNumber, email } = route.params;
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (char && index === OTP_LENGTH - 1 && next.every((d) => d !== '')) {
      handleVerify(next.join(''));
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
    }
  }

  async function handleVerify(code?: string) {
    const otp = code || digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${API_URL}/api/auth/verify-otp`, { phoneNumber, otp });

      const meRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      await login(res.data.accessToken, res.data.refreshToken || '', meRes.data);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Invalid or expired OTP. Please try again.';
      setError(message);
      // Clear inputs on error
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, { phoneNumber });
      setResendCooldown(60);
      Alert.alert('OTP Sent', `A new code has been sent to ${phoneNumber}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.iconArea}>
          <View style={styles.smsIcon}>
            <Text style={{ fontSize: 40 }}>📱</Text>
          </View>
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ fontWeight: '800', color: BRAND.navy }}>{phoneNumber}</Text>
        </Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* OTP Input Row */}
        <View style={styles.otpRow}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref: TextInput | null) => { inputRefs.current[i] = ref; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : undefined]}
              value={digit}
              onChangeText={(v: string) => handleDigitChange(i, v)}
              onKeyPress={({ nativeEvent }: any) => handleKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, (loading || digits.some((d) => !d)) && styles.disabledBtn]}
          onPress={() => handleVerify()}
          disabled={loading || digits.some((d) => !d)}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={BRAND.white} />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0 || resending}>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldown}>Resend in {resendCooldown}s</Text>
            ) : (
              <Text style={styles.resendLink}>{resending ? 'Sending...' : 'Resend Code'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.white },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },
  backBtn: { marginBottom: 32 },
  backText: { color: BRAND.green, fontSize: 15, fontWeight: '700' },
  iconArea: { alignItems: 'center', marginBottom: 28 },
  smsIcon: { width: 88, height: 88, borderRadius: 28, backgroundColor: BRAND.green + '15', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: BRAND.navy, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: BRAND.gray500, textAlign: 'center', lineHeight: 22, marginBottom: 28, fontWeight: '500' },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: 12, marginBottom: 20 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 36 },
  otpBox: { width: 50, height: 60, borderRadius: 16, borderWidth: 1.5, borderColor: BRAND.gray200, backgroundColor: BRAND.gray50, fontSize: 26, fontWeight: '900', color: BRAND.navy },
  otpBoxFilled: { borderColor: BRAND.green, backgroundColor: BRAND.green + '08' },
  verifyBtn: { backgroundColor: BRAND.green, borderRadius: 18, paddingVertical: 17, alignItems: 'center', shadowColor: BRAND.green, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 },
  disabledBtn: { opacity: 0.55 },
  verifyBtnText: { color: BRAND.white, fontSize: 16, fontWeight: '800' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  resendLabel: { color: BRAND.gray500, fontSize: 14 },
  resendCooldown: { color: BRAND.gray400, fontSize: 14, fontWeight: '600' },
  resendLink: { color: BRAND.green, fontSize: 14, fontWeight: '800' },
});
