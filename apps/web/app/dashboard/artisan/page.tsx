'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardNav } from '../../../components/DashboardNav';
import { DashboardWelcome } from '../../../components/DashboardWelcome';
import { ArtisanVerificationBanner } from '../../../components/ArtisanVerificationBanner';
import { ArtisanBookingsPanel } from '../../../components/BookingsPanel';
import { apiGet, apiPost } from '../../../lib/api';
import { fetchArtisanStats } from '../../../lib/marketplace';
import { getAccessToken } from '../../../lib/auth-storage';

function EarningsChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end justify-between gap-3 h-40 px-2">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400">₦{(d.amount / 1000).toFixed(0)}k</span>
          <div className="w-full rounded-t-xl bg-brand-green/15 relative overflow-hidden" style={{ height: `${(d.amount / max) * 100}%` }}>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-green to-brand-green/70 rounded-t-xl" style={{ height: '100%' }} />
          </div>
          <span className="text-xs font-bold text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function ArtisanDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const token = getAccessToken();

  const { data: stats } = useQuery({
    queryKey: ['artisan', 'stats'],
    queryFn: fetchArtisanStats,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (!token) return;
    apiGet<{ isOnline: boolean }>('/artisan/me', token)
      .then((profile) => setIsOnline(profile.isOnline))
      .catch(() => undefined);
  }, [token]);

  async function toggleAvailability() {
    if (!token) return;
    const next = !isOnline;
    setIsOnline(next);
    try {
      await apiPost('/artisan/availability', { isOnline: next }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setIsOnline(!next);
    }
  }

  const monthlyTotal = stats?.monthlyEarnings.reduce((sum, m) => sum + m.amount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-hidden md:pl-64">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <DashboardNav variant="artisan" />
      <ArtisanVerificationBanner />

      {!isOnline && (
        <div className="bg-gray-800 text-white text-center py-2 text-sm font-medium">
          You are currently <strong>offline</strong>. Toggle back online to receive new job requests.
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <DashboardWelcome subtitle="Manage your jobs, track earnings, and update your availability." />
          <button
            onClick={toggleAvailability}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full border shadow-sm hover:shadow-md transition-all self-start md:self-auto ${isOnline ? 'bg-white border-brand-green/30' : 'bg-gray-50 border-gray-200'}`}
          >
            {isOnline && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
              </span>
            )}
            <span className={`text-sm font-bold ${isOnline ? 'text-brand-green' : 'text-gray-500'}`}>
              {isOnline ? 'Accepting Requests' : 'Currently Offline'}
            </span>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isOnline ? 'bg-brand-green' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-2 bg-brand-navy text-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(13,43,94,0.2)] bg-gradient-to-br from-brand-navy to-[#1a3d7a]">
            <h3 className="text-slate-300 font-medium mb-1">Total Earnings</h3>
            <p className="text-5xl font-black tracking-tight">₦ {(stats?.totalEarnings ?? 0).toLocaleString()}</p>
            {stats && (
              <p className="mt-4 text-brand-green font-bold text-sm bg-white/10 inline-block px-3 py-1 rounded-full">
                {stats.growthPercent >= 0 ? '↑' : '↓'} {Math.abs(stats.growthPercent)}% vs last month
              </p>
            )}
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-medium mb-1">Completed Jobs</h3>
            <p className="text-4xl font-black text-brand-navy">{stats?.completedJobs ?? 0}</p>
            <p className="text-sm text-green-600 font-bold mt-4">98% Completion Rate</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-medium mb-1">Rating</h3>
            <p className="text-4xl font-black text-brand-navy">
              {stats?.averageRating ?? 0} <span className="text-lg text-gray-400 font-normal">/ 5.0</span>
            </p>
            <p className="text-sm text-gray-400 mt-4">{stats?.reviewCount ?? 0} reviews • &lt; 15m response</p>
          </div>
        </div>

        <ArtisanBookingsPanel />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Earnings Overview</h2>
          <div className="bg-white rounded-3xl shadow border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-500 text-sm font-medium">Last 6 months</p>
                <p className="text-3xl font-black text-brand-navy">₦ {monthlyTotal.toLocaleString()}</p>
              </div>
            </div>
            <EarningsChart data={stats?.monthlyEarnings ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
