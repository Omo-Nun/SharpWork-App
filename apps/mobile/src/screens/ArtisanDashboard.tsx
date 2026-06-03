import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

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

// --- Earnings Bar Chart (simple bars) ---
function EarningsChart() {
  const data = [
    { day: 'Mon', amount: 15000 },
    { day: 'Tue', amount: 32000 },
    { day: 'Wed', amount: 24000 },
    { day: 'Thu', amount: 45000 },
    { day: 'Fri', amount: 38000 },
    { day: 'Sat', amount: 60000 },
    { day: 'Sun', amount: 10000 },
  ];
  const maxVal = Math.max(...data.map((d) => d.amount));

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>This Week's Earnings</Text>
      <Text style={chartStyles.total}>₦ 224,000</Text>
      <View style={chartStyles.barsRow}>
        {data.map((item) => (
          <View key={item.day} style={chartStyles.barWrapper}>
            <View style={chartStyles.barTrack}>
              <View
                style={[
                  chartStyles.bar,
                  { height: `${Math.max(8, (item.amount / maxVal) * 100)}%` },
                ]}
              />
            </View>
            <Text style={chartStyles.barLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- Incoming Job Request Card ---
function JobRequestCard({ service, customer, location, amount, onAccept, onDecline }: {
  service: string; customer: string; location: string; amount: string;
  onAccept: () => void; onDecline: () => void;
}) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestIndicator} />
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestService}>{service}</Text>
          <Text style={styles.requestAmount}>{amount}</Text>
        </View>
        <Text style={styles.requestCustomer}>👤 {customer}</Text>
        <Text style={styles.requestLocation}>📍 {location}</Text>
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.8}>
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
            <Text style={styles.acceptBtnText}>✓ Accept Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ArtisanDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasRequest, setHasRequest] = useState(true);

  const handleToggleOnline = (val: boolean) => {
    setIsOnline(val);
    Alert.alert(
      val ? 'You are now Online' : 'You are now Offline',
      val ? 'You will start receiving job requests.' : 'You will not receive new job requests.',
    );
  };

  const handleAccept = () => {
    Alert.alert('Job Accepted!', 'The customer has been notified. Head to the location.');
    setHasRequest(false);
  };

  const handleDecline = () => {
    Alert.alert('Job Declined', 'The request has been removed.');
    setHasRequest(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Artisan Portal</Text>
            <Text style={styles.username}>Felix Okafor</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Artisan</Text>
            </View>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineLabel, { color: isOnline ? BRAND.green : BRAND.gray400 }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: BRAND.gray100, true: BRAND.green + '50' }}
              thumbColor={isOnline ? BRAND.green : BRAND.gray400}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>
        </View>

        {/* Incoming Request Alert */}
        {isOnline && hasRequest && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertIcon}>🔔</Text>
            <Text style={styles.alertText}>New job request nearby!</Text>
          </View>
        )}

        {/* KPI Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiRow} contentContainerStyle={{ paddingRight: 20 }}>
          {[
            { label: 'Total Earnings', value: '₦450k', icon: '💰', bg: BRAND.navy, textColor: BRAND.white },
            { label: 'Completed Jobs', value: '28', icon: '✅', bg: BRAND.white, textColor: BRAND.navy },
            { label: 'Rating', value: '4.9 ★', icon: '⭐', bg: BRAND.white, textColor: BRAND.navy },
            { label: 'This Month', value: '₦82k', icon: '📈', bg: BRAND.white, textColor: BRAND.navy },
          ].map((item) => (
            <View key={item.label} style={[styles.kpiCard, { backgroundColor: item.bg }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={[styles.kpiValue, { color: item === null ? BRAND.white : item.textColor }]}>{item.value}</Text>
              <Text style={[styles.kpiLabel, { color: item.bg === BRAND.navy ? '#94A3B8' : BRAND.gray500 }]}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Earnings Chart */}
        <View style={styles.section}>
          <EarningsChart />
        </View>

        {/* Incoming Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incoming Requests</Text>
          {isOnline && hasRequest ? (
            <JobRequestCard
              service="Leaky Faucet Repair"
              customer="Samuel K."
              location="2.4 km away — Lekki Phase 1"
              amount="₦15,000"
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ) : (
            <View style={styles.emptyRequests}>
              <Text style={styles.emptyIcon}>{isOnline ? '⏳' : '🔴'}</Text>
              <Text style={styles.emptyText}>
                {isOnline ? 'Waiting for new requests...' : 'Go online to receive job requests.'}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Withdraw\nFunds', icon: '🏦' },
              { label: 'Update\nPortfolio', icon: '📸' },
              { label: 'View\nReviews', icon: '⭐' },
              { label: 'Account\nSettings', icon: '⚙️' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionCard} activeOpacity={0.8}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const chartStyles = StyleSheet.create({
  container: { backgroundColor: BRAND.navy, borderRadius: 24, padding: 22 },
  title: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  total: { color: BRAND.white, fontSize: 32, fontWeight: '900', marginBottom: 20 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end' },
  barWrapper: { alignItems: 'center', flex: 1 },
  barTrack: { width: '60%', height: 80, justifyContent: 'flex-end' },
  bar: { backgroundColor: BRAND.green, borderRadius: 6, width: '100%' },
  barLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', marginTop: 6 },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.gray50 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: BRAND.white,
  },
  greeting: { fontSize: 13, color: BRAND.gray500, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  username: { fontSize: 22, fontWeight: '900', color: BRAND.navy, marginTop: 3 },
  verifiedBadge: { backgroundColor: BRAND.green + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6, alignSelf: 'flex-start' },
  verifiedText: { color: BRAND.green, fontSize: 12, fontWeight: '700' },
  onlineToggle: { alignItems: 'center', gap: 6 },
  onlineLabel: { fontSize: 13, fontWeight: '800' },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.orange + '15',
    borderLeftWidth: 4,
    borderLeftColor: BRAND.orange,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  alertIcon: { fontSize: 20 },
  alertText: { fontSize: 14, fontWeight: '700', color: BRAND.orange },
  kpiRow: { paddingLeft: 20, marginVertical: 20 },
  kpiCard: {
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: BRAND.gray100,
  },
  kpiValue: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  kpiLabel: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: BRAND.navy, marginBottom: 14 },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: BRAND.green + '30',
  },
  requestIndicator: { width: 5, backgroundColor: BRAND.green },
  requestContent: { flex: 1, padding: 16 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestService: { fontSize: 17, fontWeight: '900', color: BRAND.navy },
  requestAmount: { fontSize: 16, fontWeight: '800', color: BRAND.green },
  requestCustomer: { fontSize: 14, color: BRAND.gray700, marginBottom: 4 },
  requestLocation: { fontSize: 13, color: BRAND.gray500, marginBottom: 16 },
  requestActions: { flexDirection: 'row', gap: 10 },
  declineBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: BRAND.gray100, alignItems: 'center' },
  declineBtnText: { fontWeight: '700', color: BRAND.gray700, fontSize: 14 },
  acceptBtn: { flex: 2, paddingVertical: 12, borderRadius: 14, backgroundColor: BRAND.green, alignItems: 'center' },
  acceptBtnText: { fontWeight: '800', color: BRAND.white, fontSize: 14 },
  emptyRequests: { backgroundColor: BRAND.white, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: BRAND.gray100 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { color: BRAND.gray500, fontWeight: '600', textAlign: 'center', fontSize: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    backgroundColor: BRAND.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: BRAND.gray100,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: BRAND.navy, textAlign: 'center' },
});
