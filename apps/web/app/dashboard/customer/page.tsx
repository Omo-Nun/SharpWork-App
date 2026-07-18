'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '../../../components/DashboardNav';
import { DashboardWelcome } from '../../../components/DashboardWelcome';
import { CustomerBookingsPanel } from '../../../components/BookingsPanel';
import { apiGet, apiPatch } from '../../../lib/api';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');

  // Notifications state
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'Artisan confirmed your booking request.', date: 'Just now' },
    { id: 2, text: 'Payment verification successful.', date: '2 hours ago' },
    { id: 3, text: 'Welcome to SharpWork!', date: '1 day ago' },
  ]);

  // Transaction history
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const me = await apiGet<any>('/auth/me');
        setProfile(me.profile);
        setAddress(me.profile?.address || '');

        // Fetch bookings to extract transactions
        const bookings = await apiGet<any[]>('/bookings');
        const paidBookings = (Array.isArray(bookings) ? bookings : []).filter((b: any) => b.paymentStatus === 'PAID');
        setTransactions(paidBookings);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoadingTx(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setLoadingAddress(true);
    setAddressError('');
    setAddressSuccess('');
    try {
      await apiPatch('/auth/profile', { address });
      setAddressSuccess('Address updated successfully!');
      setIsEditingAddress(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to update address.');
    } finally {
      setLoadingAddress(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[80px] pointer-events-none"></div>

      <DashboardNav variant="customer" />

      <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
        <DashboardWelcome subtitle="Manage your service requests, profile, and active bookings." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Bookings Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💼 Service Bookings
              </h2>
              <CustomerBookingsPanel />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Address Widget */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  📍 Service Address
                </h3>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs text-brand-green font-bold hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {addressError && <div className="text-xs text-red-600 mb-2">{addressError}</div>}
              {addressSuccess && <div className="text-xs text-emerald-600 mb-2">{addressSuccess}</div>}

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-3">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    rows={3}
                    className="w-full text-sm p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-3 py-1.5 text-xs font-bold border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAddress}
                      className="px-3 py-1.5 text-xs font-bold bg-brand-green text-white rounded-lg hover:bg-green-700"
                    >
                      {loadingAddress ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  {address || 'No address provided yet.'}
                </p>
              )}
            </div>

            {/* Notifications Alert / Widget */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  🔔 Notifications
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!notificationsMuted}
                    onChange={() => setNotificationsMuted(!notificationsMuted)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
                </label>
              </div>

              {notificationsMuted ? (
                <p className="text-xs text-gray-400 italic">Notifications are currently muted.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      <p className="text-gray-700 font-medium">{n.text}</p>
                      <span className="text-[10px] text-gray-400 font-bold block text-right">{n.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction History Widget */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                💳 Receipts & Transactions
              </h3>

              {loadingTx ? (
                <p className="text-xs text-gray-400">Loading history...</p>
              ) : transactions.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No transactions found.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3 border rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs text-gray-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Ref: {tx.paystackRef || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xs text-brand-green block">
                          ₦{tx.price?.toLocaleString() || '0'}
                        </span>
                        <button
                          onClick={() => alert(`Receipt details:\nBooking ID: ${tx.id}\nPaid amount: ₦${tx.price}\nReference: ${tx.paystackRef}`)}
                          className="text-[10px] font-bold text-gray-400 hover:text-brand-green transition-all"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
