import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const BRAND = {
  green: '#007A52',
  navy: '#0D2B5E',
  orange: '#F56500',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
};

const STEPS = [
  { id: 1, title: 'Identity Check', subtitle: 'NIN Verification via Smile Identity' },
  { id: 2, title: 'Skill Assessment', subtitle: 'Portfolio & category upload' },
  { id: 3, title: 'Background Check', subtitle: 'Criminal records consent' },
  { id: 4, title: 'References', subtitle: 'Previous client contacts' },
];

// --- Step Content Components ---
function StepIdentity() {
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Identity Verification</Text>
      <Text style={stepStyles.subtitle}>Your NIN will be verified securely using Smile Identity API (confidence threshold: 80%).</Text>

      <View style={stepStyles.livenessMock}>
        <View style={stepStyles.faceFrame}>
          <Text style={{ fontSize: 60 }}>😊</Text>
          <View style={stepStyles.faceCornerTL} />
          <View style={stepStyles.faceCornerTR} />
          <View style={stepStyles.faceCornerBL} />
          <View style={stepStyles.faceCornerBR} />
        </View>
        <Text style={stepStyles.livenessLabel}>Smile Identity — Liveness Camera</Text>
        <Text style={stepStyles.livenessHint}>Center your face in the frame and hold still</Text>
      </View>

      <View style={stepStyles.field}>
        <Text style={stepStyles.fieldLabel}>National Identity Number (NIN)</Text>
        <TextInput
          style={stepStyles.input}
          placeholder="Enter 11-digit NIN"
          placeholderTextColor={BRAND.gray400}
          keyboardType="numeric"
          maxLength={11}
        />
      </View>
    </View>
  );
}

function StepSkills() {
  const [selected, setSelected] = useState<string[]>([]);
  const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'Welding', 'Tiling', 'HVAC'];

  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Skills & Portfolio</Text>
      <Text style={stepStyles.subtitle}>Select your primary service categories and upload work photos.</Text>

      <Text style={stepStyles.fieldLabel}>Select your skills:</Text>
      <View style={stepStyles.chipsRow}>
        {categories.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelected(isSelected ? selected.filter((s) => s !== cat) : [...selected, cat])}
              style={[stepStyles.chip, isSelected && stepStyles.chipSelected]}
              activeOpacity={0.8}
            >
              <Text style={[stepStyles.chipText, isSelected && stepStyles.chipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={stepStyles.uploadBox} activeOpacity={0.8}>
        <Text style={{ fontSize: 36, marginBottom: 10 }}>📷</Text>
        <Text style={stepStyles.uploadTitle}>Upload Portfolio Photos</Text>
        <Text style={stepStyles.uploadHint}>Max 5 photos • PNG, JPG up to 10MB each</Text>
      </TouchableOpacity>
    </View>
  );
}

function StepBackground() {
  const [consented, setConsented] = useState(false);
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Background Check</Text>
      <Text style={stepStyles.subtitle}>We are required by law to perform a background and public records check for artisan safety.</Text>

      <View style={stepStyles.consentBox}>
        <TouchableOpacity
          style={[stepStyles.checkbox, consented && stepStyles.checkboxChecked]}
          onPress={() => setConsented(!consented)}
          activeOpacity={0.8}
        >
          {consented && <Text style={{ color: BRAND.white, fontSize: 14, fontWeight: '900' }}>✓</Text>}
        </TouchableOpacity>
        <Text style={stepStyles.consentText}>
          I authorize SharpWork and its background check partners to conduct a criminal background and public records check. I understand this is a requirement for operating on the platform.
        </Text>
      </View>

      <View style={stepStyles.infoBox}>
        <Text style={stepStyles.infoIcon}>🔒</Text>
        <Text style={stepStyles.infoText}>Your data is encrypted and used solely for verification purposes. It will never be sold to third parties.</Text>
      </View>
    </View>
  );
}

function StepReferences() {
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>References</Text>
      <Text style={stepStyles.subtitle}>Provide contact details for two previous clients. We may call to verify.</Text>

      {[1, 2].map((n) => (
        <View key={n} style={stepStyles.referenceCard}>
          <Text style={stepStyles.referenceTitle}>Reference {n}</Text>
          <View style={stepStyles.field}>
            <Text style={stepStyles.fieldLabel}>Full Name</Text>
            <TextInput style={stepStyles.input} placeholder="e.g. John Adeyemi" placeholderTextColor={BRAND.gray400} />
          </View>
          <View style={stepStyles.field}>
            <Text style={stepStyles.fieldLabel}>Phone Number</Text>
            <TextInput style={stepStyles.input} placeholder="+234 800 000 0000" placeholderTextColor={BRAND.gray400} keyboardType="phone-pad" />
          </View>
        </View>
      ))}
    </View>
  );
}

// --- Main Verification Screen ---
export default function VerificationFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  const stepComponents: Record<number, React.ReactNode> = {
    1: <StepIdentity />,
    2: <StepSkills />,
    3: <StepBackground />,
    4: <StepReferences />,
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        'Verification Submitted! 🎉',
        'Your application has been sent for review. You will be notified within 24–48 hours.',
        [{ text: 'Got it', style: 'default' }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Artisan Verification</Text>
        <Text style={styles.headerSubtitle}>Step {currentStep} of 4</Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsRow}>
        {STEPS.map((step) => (
          <TouchableOpacity
            key={step.id}
            onPress={() => setCurrentStep(step.id)}
            style={styles.stepDot}
            activeOpacity={0.8}
          >
            <View style={[
              styles.stepCircle,
              currentStep > step.id && styles.stepDone,
              currentStep === step.id && styles.stepActive,
            ]}>
              {currentStep > step.id
                ? <Text style={{ color: BRAND.white, fontWeight: '900', fontSize: 13 }}>✓</Text>
                : <Text style={[styles.stepNum, currentStep === step.id && { color: BRAND.white }]}>{step.id}</Text>
              }
            </View>
            {step.id < 4 && <View style={[styles.stepLine, currentStep > step.id && styles.stepLineDone]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Step Label */}
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabelTitle}>{STEPS[currentStep - 1].title}</Text>
        <Text style={styles.stepLabelSub}>{STEPS[currentStep - 1].subtitle}</Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {stepComponents[currentStep]}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.backBtn, currentStep === 1 && styles.backBtnHidden]}
          onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentStep === 4 ? '🚀 Submit for Review' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const stepStyles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 22, fontWeight: '900', color: BRAND.navy, marginBottom: 8 },
  subtitle: { fontSize: 14, color: BRAND.gray500, marginBottom: 24, lineHeight: 22 },
  livenessMock: {
    backgroundColor: BRAND.navy,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  faceFrame: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  faceCornerTL: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: BRAND.green, borderRadius: 4 },
  faceCornerTR: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: BRAND.green, borderRadius: 4 },
  faceCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: BRAND.green, borderRadius: 4 },
  faceCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: BRAND.green, borderRadius: 4 },
  livenessLabel: { color: BRAND.white, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  livenessHint: { color: '#64748B', fontSize: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: BRAND.gray700, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: BRAND.gray100,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: BRAND.navy,
    backgroundColor: BRAND.gray50,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, borderWidth: 1.5, borderColor: BRAND.gray100, backgroundColor: BRAND.gray50 },
  chipSelected: { borderColor: BRAND.green, backgroundColor: BRAND.green + '15' },
  chipText: { fontSize: 13, fontWeight: '700', color: BRAND.gray500 },
  chipTextSelected: { color: BRAND.green },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: BRAND.gray400,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    backgroundColor: BRAND.gray50,
  },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: BRAND.navy, marginBottom: 6 },
  uploadHint: { fontSize: 12, color: BRAND.gray400 },
  consentBox: { flexDirection: 'row', gap: 14, marginBottom: 20, backgroundColor: BRAND.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: BRAND.gray100 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: BRAND.gray400, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: BRAND.green, borderColor: BRAND.green },
  consentText: { flex: 1, fontSize: 13, color: BRAND.gray700, lineHeight: 22 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', padding: 14, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 20 },
  referenceCard: { backgroundColor: BRAND.white, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: BRAND.gray100 },
  referenceTitle: { fontSize: 15, fontWeight: '800', color: BRAND.navy, marginBottom: 14 },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.gray50 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: BRAND.white, borderBottomWidth: 1, borderBottomColor: BRAND.gray100 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: BRAND.navy },
  headerSubtitle: { fontSize: 14, color: BRAND.gray500, marginTop: 2, fontWeight: '600' },
  stepsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: BRAND.white },
  stepDot: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: BRAND.gray100,
    backgroundColor: BRAND.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: { borderColor: BRAND.navy, backgroundColor: BRAND.navy },
  stepDone: { borderColor: BRAND.green, backgroundColor: BRAND.green },
  stepNum: { fontSize: 14, fontWeight: '800', color: BRAND.gray400 },
  stepLine: { flex: 1, height: 2, backgroundColor: BRAND.gray100, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: BRAND.green },
  stepLabelRow: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BRAND.white, borderBottomWidth: 1, borderBottomColor: BRAND.gray100 },
  stepLabelTitle: { fontSize: 18, fontWeight: '900', color: BRAND.navy },
  stepLabelSub: { fontSize: 13, color: BRAND.gray500, marginTop: 3 },
  content: { flex: 1, paddingTop: 20 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: BRAND.white,
    borderTopWidth: 1,
    borderTopColor: BRAND.gray100,
  },
  backBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, backgroundColor: BRAND.gray100, alignItems: 'center', justifyContent: 'center' },
  backBtnHidden: { opacity: 0 },
  backBtnText: { fontWeight: '700', color: BRAND.gray700, fontSize: 15 },
  nextBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: BRAND.green, alignItems: 'center', justifyContent: 'center', shadowColor: BRAND.green, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  nextBtnText: { fontWeight: '900', color: BRAND.white, fontSize: 16 },
});
