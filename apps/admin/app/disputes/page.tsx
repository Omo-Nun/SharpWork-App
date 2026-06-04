'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';

interface Dispute {
  id: string;
  reason: string;
  status: DisputeStatus;
  escrowFrozen: boolean;
  adminNotes: string | null;
  createdAt: string;
  booking: {
    id: string;
    description: string;
    price: number;
    customer: { email: string };
    artisan: { email: string };
  };
  raisedBy: { email: string };
}

const STATUS_COLORS: Record<DisputeStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ESCALATED: 'bg-purple-100 text-purple-700',
};

export default function DisputeCentre() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDisputes = () => {
    apiGet<Dispute[]>('/admin/disputes', getAccessToken())
      .then(setDisputes)
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  useEffect(() => {
    setAdminNotes(selectedDispute?.adminNotes || '');
  }, [selectedDispute]);

  const updateDispute = async (status: DisputeStatus, resolution?: 'refund_customer' | 'release_artisan') => {
    if (!selectedDispute) return;

    await apiPatch(
      `/admin/disputes/${selectedDispute.id}`,
      { status, adminNotes, escrowFrozen: status !== 'RESOLVED', ...(resolution ? { resolution } : {}) },
      getAccessToken()
    );

    loadDisputes();
    setSelectedDispute(null);
  };

  if (loading) {
    return <p className="text-gray-500">Loading disputes...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dispute Centre</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border text-gray-500">No disputes found.</div>
          ) : (
            disputes.map((dispute) => (
              <button
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute)}
                className={`w-full text-left bg-white p-5 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  selectedDispute?.id === dispute.id ? 'ring-2 ring-brand-green' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg">{dispute.booking.description}</p>
                    <p className="text-sm text-gray-500">Raised by: {dispute.raisedBy.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[dispute.status]}`}>
                    {dispute.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{dispute.reason}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>Amount: ₦{dispute.booking.price.toLocaleString()}</span>
                  {dispute.escrowFrozen && <span className="text-red-500 font-bold">ESCROW FROZEN</span>}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          {selectedDispute ? (
            <>
              <h2 className="text-xl font-bold mb-4">Dispute Details</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Customer:</span> {selectedDispute.booking.customer.email}</div>
                <div><span className="text-gray-500">Artisan:</span> {selectedDispute.booking.artisan.email}</div>
                <div><span className="text-gray-500">Amount:</span> ₦{selectedDispute.booking.price.toLocaleString()}</div>
              </div>

              <div className="border-t mt-6 pt-4">
                <h3 className="font-bold mb-2">Admin Notes</h3>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm outline-brand-green"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => updateDispute('UNDER_REVIEW')}
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => updateDispute('RESOLVED', 'release_artisan')}
                  className="w-full bg-brand-green text-white py-2 rounded-lg font-bold"
                >
                  Resolve & Release to Artisan
                </button>
                <button
                  onClick={() => updateDispute('RESOLVED', 'refund_customer')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold"
                >
                  Resolve & Refund Customer
                </button>
                <button
                  onClick={() => updateDispute('ESCALATED')}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-bold"
                >
                  Escalate
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-center py-20">
              Select a dispute to view details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
