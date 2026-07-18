import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
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
  red: '#DC2626',
};

interface ProfileScreenProps {
  onNavigateToVerification?: () => void;
}

export default function ProfileScreen({ onNavigateToVerification }: ProfileScreenProps) {
  const { user, logout, token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email || 'User';

  const roleLabel = user?.role === 'ARTISAN' ? 'Artisan' : user?.role === 'ADMIN' ? 'Admin' : 'Customer';
  const roleColor = user?.role === 'ARTISAN' ? BRAND.green : user?.role === 'ADMIN' ? BRAND.orange : '#3B82F6';

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          setLoggingOut(false);
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently soft-delete your account and remove your profile from public view. This cannot be easily undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm. Tap "Confirm" to proceed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await axios.delete(`${API_URL}/api/auth/account`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      await logout();
                    } catch (err: any) {
                      const message = err?.response?.data?.error || 'Failed to delete account.';
                      Alert.alert('Error', message);
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.phoneText}>{user?.phoneNumber}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          {[
            { label: 'Email', value: user?.email || '—' },
            { label: 'Phone', value: user?.phoneNumber || '—' },
            { label: 'Role', value: roleLabel },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Artisan: Verification shortcut */}
        {user?.role === 'ARTISAN' && onNavigateToVerification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Artisan Actions</Text>
            <TouchableOpacity style={styles.actionRow} onPress={onNavigateToVerification} activeOpacity={0.8}>
              <View style={styles.actionIcon}><Text style={{ fontSize: 20 }}>✅</Text></View>
              <Text style={styles.actionLabel}>Verification Status</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </View>
            <Text style={styles.actionLabel}>{loggingOut ? 'Logging out...' : 'Log Out'}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, { color: BRAND.red }]}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Deleting your account will soft-delete your profile and remove you from public listings. Your data is retained per our privacy policy.
          </Text>
          <TouchableOpacity
            style={[styles.deleteBtn, isDeleting && { opacity: 0.6 }]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.85}
          >
            {isDeleting ? (
              <ActivityIndicator color={BRAND.white} />
            ) : (
              <Text style={styles.deleteBtnText}>🗑 Delete My Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.gray50 },
  scroll: { paddingBottom: 20 },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: BRAND.navy,
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: BRAND.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: BRAND.white },
  displayName: { fontSize: 24, fontWeight: '900', color: BRAND.white, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 10 },
  roleText: { fontSize: 13, fontWeight: '800' },
  emailText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 2 },
  phoneText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  section: { marginTop: 20, marginHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: BRAND.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.gray100,
  },
  infoLabel: { fontSize: 14, color: BRAND.gray500, fontWeight: '600' },
  infoValue: { fontSize: 14, color: BRAND.navy, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.gray100,
    gap: 12,
  },
  actionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: BRAND.gray100, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, color: BRAND.navy, fontWeight: '700' },
  actionArrow: { fontSize: 22, color: BRAND.gray400, fontWeight: '300' },
  dangerSection: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerDesc: { fontSize: 13, color: '#991B1B', lineHeight: 18, marginBottom: 16, fontWeight: '500' },
  deleteBtn: { backgroundColor: BRAND.red, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { color: BRAND.white, fontSize: 15, fontWeight: '800' },
});
