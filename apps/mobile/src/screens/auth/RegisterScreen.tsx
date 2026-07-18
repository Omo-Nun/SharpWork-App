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
} from 'react-native';
import axios from 'axios';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type RoleOption = 'CUSTOMER' | 'ARTISAN';

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleOption>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phone.trim(),
        password,
        role,
      });
      navigation.navigate('OTP', { phoneNumber: phone.trim(), email: email.trim().toLowerCase() });
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>S</Text>
            </View>
            <Text style={styles.logoText}>
              Sharp<Text style={{ color: BRAND.green }}>Work</Text>
            </Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join SharpWork</Text>
            <Text style={styles.cardSubtitle}>Trusted artisans. Verified professionals.</Text>

            {/* Role Selector */}
            <View style={styles.roleRow}>
              {(['CUSTOMER', 'ARTISAN'] as RoleOption[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.roleActive]}
                  onPress={() => setRole(r)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleIcon}>{r === 'CUSTOMER' ? '👤' : '🔧'}</Text>
                  <Text style={[styles.roleBtnText, role === r && styles.roleActiveText]}>
                    {r === 'CUSTOMER' ? 'Customer' : 'Artisan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ada"
                  placeholderTextColor={BRAND.gray400}
                  value={firstName}
                  onChangeText={setFirstName}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  placeholder="Obi"
                  placeholderTextColor={BRAND.gray400}
                  value={lastName}
                  onChangeText={setLastName}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={BRAND.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="+2348012345678"
                placeholderTextColor={BRAND.gray400}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={BRAND.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={BRAND.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By registering, you agree to SharpWork's Terms of Service and Privacy Policy.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
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
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 32, position: 'relative' },
  backBtn: { position: 'absolute', left: 24, top: 44 },
  backText: { color: BRAND.green, fontSize: 15, fontWeight: '700' },
  logoMark: { width: 56, height: 56, borderRadius: 18, backgroundColor: BRAND.green, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoMarkText: { fontSize: 28, fontWeight: '900', color: BRAND.white },
  logoText: { fontSize: 28, fontWeight: '900', color: BRAND.white },
  tagline: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  card: { marginHorizontal: 20, backgroundColor: BRAND.white, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 30, elevation: 8 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: BRAND.navy, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: BRAND.gray500, marginBottom: 20, fontWeight: '500' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: BRAND.gray200, backgroundColor: BRAND.gray50 },
  roleActive: { borderColor: BRAND.green, backgroundColor: BRAND.green + '10' },
  roleIcon: { fontSize: 18 },
  roleBtnText: { fontSize: 14, fontWeight: '700', color: BRAND.gray500 },
  roleActiveText: { color: BRAND.green },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: 12, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  nameRow: { flexDirection: 'row', marginBottom: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.gray700, marginBottom: 7 },
  input: { borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: BRAND.navy, backgroundColor: BRAND.gray50 },
  primaryBtn: { backgroundColor: BRAND.green, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: BRAND.green, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  disabledBtn: { opacity: 0.6 },
  primaryBtnText: { color: BRAND.white, fontSize: 16, fontWeight: '800' },
  terms: { marginTop: 16, paddingHorizontal: 4 },
  termsText: { fontSize: 11, color: BRAND.gray400, textAlign: 'center', lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  footerLink: { color: BRAND.green, fontSize: 14, fontWeight: '800' },
});
