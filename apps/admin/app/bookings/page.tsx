'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface EscrowPendingBooking {
  id: string;
  description: string;
  price: number;
  state: string;
  artisanCompletedAt: string | null;
  eligibleFor48hRelease: boolean;
  canAdminRelease: boolean;
  customer?: { email: string; customerProfile?: { firstName: string; lastName: string } | null };
  artisan?: { email: string; artisanProfile?: { firstName: string; lastName: string } | null };
}

export default function BookingsPage() {
  const [escrowPending, setEscrowPending] = useState<EscrowPendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    apiGet<EscrowPendingBooking[]>('/admin/bookings/escrow-pending', getAccessToken())
      .then(setEscrowPending)
      .catch(() => setEscrowPending([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function releaseEscrow(id: string) {
    setError('');
    try {
      await apiPost(`/admin/bookings/${id}/release-escrow`, {}, getAccessToken());
      load();
    } catch {
      setError('Failed to release escrow');
    }
  }

  if (loading) return <p className="text-gray-500">Loading escrow queue...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Escrow Releases</h1>
      <p className="text-gray-500 mb-8">Release held funds after customer confirmation or the 48-hour dispute window.</p>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="space-y-4">
        {escrowPending.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-gray-500">No bookings awaiting escrow release.</div>
        ) : (
          escrowPending.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-brand-navy">{booking.description.slice(0, 80)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.customer?.customerProfile
                    ? `${booking.customer.customerProfile.firstName} ${booking.customer.customerProfile.lastName}`
                    : booking.customer?.email}{' '}
                  →{' '}
                  {booking.artisan?.artisanProfile
                    ? `${booking.artisan.artisanProfile.firstName} ${booking.artisan.artisanProfile.lastName}`
                    : booking.artisan?.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Artisan completed:{' '}
                  {booking.artisanCompletedAt
                    ? new Date(booking.artisanCompletedAt).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-brand-green">₦{booking.price.toLocaleString()}</span>
                {booking.eligibleFor48hRelease && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">48h eligible</span>
                )}
                {booking.canAdminRelease && (
                  <button
                    onClick={() => releaseEscrow(booking.id)}
                    className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                  >
                    Release Escrow
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
