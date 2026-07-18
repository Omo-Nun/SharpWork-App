import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';

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

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Schedule' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Quote' },
];

interface BookingScreenProps {
  artisanId: string;
  artisanName: string;
  categorySlug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingScreen({
  artisanId,
  artisanName,
  categorySlug,
  onSuccess,
  onCancel,
}: BookingScreenProps) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (step === 1 && description.trim().length < 20) {
      setError('Please describe the job in at least 20 characters.');
      return false;
    }
    if (step === 2 && !date) {
      setError('Please select a date.');
      return false;
    }
    if (step === 3 && !address.trim()) {
      setError('Please enter the service address.');
      return false;
    }
    if (step === 4) {
      const p = Number(price);
      if (!p || p < 1000) {
        setError('Enter an agreed quote of at least ₦1,000.');
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleNext() {
    if (!validate()) return;
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    // Step 4: submit
    setLoading(true);
    try {
      const res = await axios.post<{ payment: { authorization_url: string } }>(
        `${API_URL}/api/booking`,
        {
          artisanId,
          description: description.trim(),
          price: Number(price),
          scheduledDate: date,
          scheduledTime: time || undefined,
          serviceAddress: address.trim(),
          categorySlugs: categorySlug ? [categorySlug] : [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        'Booking Created! 🎉',
        `Your booking with ${artisanName} is pending payment. Open the payment link:\n\n${res.data.payment.authorization_url}`,
        [
          { text: 'OK', onPress: onSuccess },
        ]
      );
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Booking failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Service Details</Text>
            <Text style={styles.stepSubtitle}>Describe exactly what needs to be done.</Text>
            <TextInput
              style={[styles.textArea, error ? styles.inputError : undefined]}
              placeholder="E.g. The kitchen sink is leaking and needs pipe replacement..."
              placeholderTextColor={BRAND.gray400}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{description.length} / 20 min characters</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Schedule</Text>
            <Text style={styles.stepSubtitle}>When should the artisan arrive?</Text>
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={BRAND.gray400}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Time (HH:MM, optional)"
              placeholderTextColor={BRAND.gray400}
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Service Location</Text>
            <Text style={styles.stepSubtitle}>Where should the work be done?</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : undefined]}
              placeholder="Full street address"
              placeholderTextColor={BRAND.gray400}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Agree Quote</Text>
            <Text style={styles.stepSubtitle}>Enter the agreed price. Funds go into escrow until you confirm job completion.</Text>
            <View style={styles.escrowCard}>
              <Text style={styles.escrowLabel}>Agreed Quote (₦)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="e.g. 15000"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
              />
              <Text style={styles.escrowNote}>🔒 Held securely in Paystack escrow</Text>
            </View>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <Text style={styles.summaryLine}>Artisan: {artisanName}</Text>
              <Text style={styles.summaryLine}>Job: {description.slice(0, 80)}{description.length > 80 ? '...' : ''}</Text>
              <Text style={styles.summaryLine}>Date: {date || 'Flexible'} {time}</Text>
              <Text style={styles.summaryLine}>Location: {address}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book {artisanName}</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {STEPS.map((s) => (
            <View key={s.id} style={styles.progressStep}>
              <View style={[styles.progressDot, step >= s.id && styles.progressDotActive]}>
                {step > s.id ? (
                  <Text style={styles.progressCheck}>✓</Text>
                ) : (
                  <Text style={[styles.progressNum, step === s.id && styles.progressNumActive]}>
                    {s.id}
                  </Text>
                )}
              </View>
              <Text style={[styles.progressLabel, step >= s.id && styles.progressLabelActive]}>
                {s.label}
              </Text>
              {s.id < STEPS.length && <View style={[styles.progressLine, step > s.id && styles.progressLineActive]} />}
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.backBtn, step === 1 && styles.backBtnDisabled]}
            onPress={() => { setError(''); setStep((s) => Math.max(1, s - 1)); }}
            disabled={step === 1}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.6 }]}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={BRAND.white} />
            ) : (
              <Text style={styles.nextBtnText}>{step === 4 ? 'Pay into Escrow' : 'Continue →'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BRAND.gray100 },
  cancelBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 18, color: BRAND.gray500, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: BRAND.navy },
  progressContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', backgroundColor: BRAND.gray50 },
  progressStep: { alignItems: 'center', position: 'relative', flex: 1 },
  progressDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: BRAND.gray200, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  progressDotActive: { backgroundColor: BRAND.green },
  progressCheck: { color: BRAND.white, fontSize: 14, fontWeight: '900' },
  progressNum: { fontSize: 13, fontWeight: '700', color: BRAND.gray400 },
  progressNumActive: { color: BRAND.white },
  progressLabel: { fontSize: 10, color: BRAND.gray400, fontWeight: '600' },
  progressLabelActive: { color: BRAND.green },
  progressLine: { position: 'absolute', top: 16, left: '60%', right: '-40%', height: 2, backgroundColor: BRAND.gray200 },
  progressLineActive: { backgroundColor: BRAND.green },
  scroll: { padding: 24, flexGrow: 1 },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: 12, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  stepContent: {},
  stepTitle: { fontSize: 24, fontWeight: '900', color: BRAND.navy, marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: BRAND.gray500, marginBottom: 20, fontWeight: '500', lineHeight: 20 },
  textArea: { borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 16, padding: 16, fontSize: 15, color: BRAND.navy, backgroundColor: BRAND.gray50, minHeight: 140 },
  input: { borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: BRAND.navy, backgroundColor: BRAND.gray50 },
  inputError: { borderColor: '#FECACA' },
  charCount: { fontSize: 12, color: BRAND.gray400, marginTop: 8, fontWeight: '500' },
  escrowCard: { backgroundColor: BRAND.navy, borderRadius: 24, padding: 24, marginBottom: 20 },
  escrowLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  priceInput: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, fontSize: 28, fontWeight: '900', color: BRAND.white, marginBottom: 12 },
  escrowNote: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  summary: { backgroundColor: BRAND.gray50, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND.gray200 },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: BRAND.navy, marginBottom: 10 },
  summaryLine: { fontSize: 13, color: BRAND.gray700, marginBottom: 6, fontWeight: '500', lineHeight: 18 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: BRAND.gray100 },
  backBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, backgroundColor: BRAND.gray100, alignItems: 'center' },
  backBtnDisabled: { opacity: 0.4 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: BRAND.gray700 },
  nextBtn: { flex: 2, paddingVertical: 15, borderRadius: 16, backgroundColor: BRAND.green, alignItems: 'center', shadowColor: BRAND.green, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: BRAND.white },
});
