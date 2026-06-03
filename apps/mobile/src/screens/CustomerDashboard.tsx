import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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

// --- Sub Components ---
function KPICard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: accent }]}>
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, { color: accent }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function BookingCard({ serviceName, artisanName, time, status, statusColor }: {
  serviceName: string; artisanName: string; time: string; status: string; statusColor: string;
}) {
  return (
    <TouchableOpacity style={styles.bookingCard} activeOpacity={0.85}>
      <View style={styles.bookingAvatarWrapper}>
        <View style={[styles.bookingAvatar, { backgroundColor: statusColor + '20' }]}>
          <Text style={{ fontSize: 22 }}>🔧</Text>
        </View>
        {/* Live pulse dot for In Progress */}
        {status === 'In Progress' && (
          <View style={styles.liveDot} />
        )}
      </View>
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingTitle}>{serviceName}</Text>
        <Text style={styles.bookingMeta}>{artisanName}</Text>
        <Text style={styles.bookingTime}>{time}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.username}>John Adeyemi</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search plumbers, electricians...</Text>
        </TouchableOpacity>

        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiRow} contentContainerStyle={{ paddingRight: 20 }}>
          <KPICard label="Active Bookings" value="2" icon="📋" accent={BRAND.green} />
          <KPICard label="Completed Jobs" value="14" icon="✅" accent="#3B82F6" />
          <KPICard label="Total Spent" value="₦150k" icon="💳" accent={BRAND.orange} />
        </ScrollView>

        {/* Nearby Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book a Service</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {[
              { label: 'Plumber', icon: '🔧', color: '#DBEAFE' },
              { label: 'Electrician', icon: '⚡', color: '#FEF9C3' },
              { label: 'Cleaner', icon: '🧹', color: '#DCFCE7' },
              { label: 'Carpenter', icon: '🪚', color: '#FFE4C4' },
              { label: 'Painter', icon: '🎨', color: '#F3E8FF' },
            ].map((cat) => (
              <TouchableOpacity key={cat.label} style={[styles.categoryChip, { backgroundColor: cat.color }]} activeOpacity={0.75}>
                <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bookings */}
        <View style={styles.section}>
          <View style={styles.tabRow}>
            {(['active', 'history'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab === 'active' ? 'Active Jobs' : 'History'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'active' ? (
            <>
              <BookingCard serviceName="Plumbing Repair" artisanName="Felix Okafor" time="Tomorrow, 10:00 AM" status="Accepted" statusColor="#3B82F6" />
              <BookingCard serviceName="Electrical Rewiring" artisanName="Jane Doe" time="Today, 2:00 PM" status="In Progress" statusColor={BRAND.orange} />
            </>
          ) : (
            <>
              <BookingCard serviceName="Wall Painting" artisanName="Ahmed Bello" time="May 20, 9:00 AM" status="Completed" statusColor={BRAND.green} />
              <BookingCard serviceName="AC Servicing" artisanName="Chidi Nwosu" time="May 15, 11:00 AM" status="Completed" statusColor={BRAND.green} />
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  greeting: { fontSize: 14, color: BRAND.gray500, fontWeight: '500' },
  username: { fontSize: 22, fontWeight: '900', color: BRAND.navy, marginTop: 2 },
  notifButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: BRAND.gray100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: BRAND.orange, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BRAND.white },
  notifBadgeText: { fontSize: 8, color: BRAND.white, fontWeight: '900' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: BRAND.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: BRAND.gray100,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchPlaceholder: { color: BRAND.gray400, fontSize: 15, fontWeight: '500' },
  kpiRow: { paddingLeft: 20, marginBottom: 8 },
  kpiCard: {
    backgroundColor: BRAND.white,
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    width: 140,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  kpiIcon: { fontSize: 24, marginBottom: 10 },
  kpiValue: { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: BRAND.gray500, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: BRAND.navy, marginBottom: 14 },
  categoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    marginRight: 12,
    width: 90,
  },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: BRAND.gray700, marginTop: 8 },
  tabRow: { flexDirection: 'row', backgroundColor: BRAND.gray100, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: BRAND.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '600', color: BRAND.gray500 },
  activeTabText: { color: BRAND.navy, fontWeight: '800' },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: BRAND.gray100,
  },
  bookingAvatarWrapper: { position: 'relative', marginRight: 14 },
  bookingAvatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  liveDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.orange, borderWidth: 2, borderColor: BRAND.white },
  bookingInfo: { flex: 1 },
  bookingTitle: { fontSize: 15, fontWeight: '800', color: BRAND.navy, marginBottom: 3 },
  bookingMeta: { fontSize: 13, color: BRAND.gray500, fontWeight: '500', marginBottom: 2 },
  bookingTime: { fontSize: 12, color: BRAND.gray400 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
});
