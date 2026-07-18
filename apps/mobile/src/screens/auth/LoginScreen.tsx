import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  React.useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; role: 'CUSTOMER' | 'ARTISAN' | 'ADMIN'; phoneNumber: string };
      }>(`${API_URL}/api/auth/login`, { email: email.trim().toLowerCase(), password });

      const meRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      await login(res.data.accessToken, res.data.refreshToken || '', meRes.data);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Use biometrics to log in to SharpWork',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });
      if (result.success) {
        // Biometric passed — attempt token refresh from SecureStore
        Alert.alert('Biometric Login', 'Biometric verified. If you have a saved session, it will be restored on restart.');
      }
    } catch {
      setError('Biometric authentication failed.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>S</Text>
            </View>
            <Text style={styles.logoText}>
              Sharp<Text style={{ color: BRAND.green }}>Work</Text>
            </Text>
            <Text style={styles.tagline}>Your trusted artisan marketplace</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={BRAND.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={BRAND.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Forgot Password', 'Use the web app at sharpwork.com to reset your password via SMS OTP.')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={BRAND.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric} activeOpacity={0.8}>
                <Text style={styles.biometricIcon}>👆</Text>
                <Text style={styles.biometricText}>Use Biometric Login</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.navy },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  logoArea: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logoMark: { width: 64, height: 64, borderRadius: 20, backgroundColor: BRAND.green, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoMarkText: { fontSize: 32, fontWeight: '900', color: BRAND.white },
  logoText: { fontSize: 32, fontWeight: '900', color: BRAND.white, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#94A3B8', marginTop: 6, fontWeight: '500' },
  card: { marginHorizontal: 20, backgroundColor: BRAND.white, borderRadius: 28, padding: 28, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 30, elevation: 8 },
  cardTitle: { fontSize: 26, fontWeight: '900', color: BRAND.navy, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: BRAND.gray500, marginBottom: 24, fontWeight: '500' },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: 12, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.gray700, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: BRAND.navy, backgroundColor: BRAND.gray50 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: BRAND.green, fontSize: 13, fontWeight: '700' },
  primaryBtn: { backgroundColor: BRAND.green, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: BRAND.green, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  disabledBtn: { opacity: 0.6 },
  primaryBtnText: { color: BRAND.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 8, paddingVertical: 12, borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 14 },
  biometricIcon: { fontSize: 20 },
  biometricText: { color: BRAND.gray700, fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  footerLink: { color: BRAND.green, fontSize: 14, fontWeight: '800' },
});
