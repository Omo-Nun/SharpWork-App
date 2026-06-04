'use client';

import { useEffect, useState } from 'react';
import { apiGet, ApiError } from '../lib/api';
import { getAccessToken } from '../lib/auth-storage';

interface AdminStats {
  kpis: {
    totalUsers: number;
    activeBookings: number;
    openDisputes: number;
    escalatedDisputes: number;
    pendingVerifications: number;
    escrowHeldAmount: number;
    escrowHeldCount: number;
  };
  recentActivity: Array<{
    type: 'dispute' | 'verification' | 'escrow';
    id: string;
    title: string;
    subtitle: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<AdminStats>('/admin/stats', getAccessToken())
      .then(setStats)
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'ADMIN_TOTP_REQUIRED') {
          setError('Enable 2FA in Settings before accessing the admin portal.');
        } else {
          setError('Failed to load dashboard stats');
        }
      });
  }, []);

  if (error && !stats) {
    return (
      <div>
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('2FA') && (
          <a href="/settings" className="text-brand-green font-bold hover:underline">Go to Settings → Enable 2FA</a>
        )}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const { kpis, recentActivity } = stats;

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-brand-green">
          <h3 className="text-gray-500 font-medium mb-1">Total Users</h3>
          <p className="text-4xl font-black">{kpis.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Active Bookings</h3>
          <p className="text-4xl font-black">{kpis.activeBookings}</p>
          <p className="text-sm text-gray-500 mt-1">{kpis.pendingVerifications} pending verifications</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Open Disputes</h3>
          <p className="text-4xl font-black text-red-600">{kpis.openDisputes}</p>
          <p className="text-sm text-red-500 mt-1">{kpis.escalatedDisputes} escalated</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Escrow Held</h3>
          <p className="text-4xl font-black">₦ {(kpis.escrowHeldAmount / 1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-500 mt-1">Across {kpis.escrowHeldCount} bookings</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {recentActivity.length === 0 ? (
          <p className="p-6 text-gray-500">No recent activity yet.</p>
        ) : (
          recentActivity.map((item) => (
            <div key={`${item.type}-${item.id}`} className="p-4 border-b last:border-b-0 flex justify-between items-center">
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{item.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
