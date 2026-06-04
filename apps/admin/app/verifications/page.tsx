'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface VerificationRecord {
  userId: string;
  firstName: string;
  lastName: string;
  skills: string[];
  verificationStatus: string;
  ninNumber: string | null;
  portfolioUrls: string[];
  rejectionReason: string | null;
  user: { email: string; phoneNumber: string };
  references: Array<{ name: string; phone: string; relationship: string }>;
}

export default function VerificationCentre() {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [selected, setSelected] = useState<VerificationRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiGet<VerificationRecord[]>('/admin/verifications', getAccessToken())
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (action: 'approve' | 'reject' | 'review') => {
    if (!selected) return;
    await apiPatch(
      `/admin/verifications/${selected.userId}`,
      { action, ...(action === 'reject' ? { rejectionReason } : {}) },
      getAccessToken()
    );
    setSelected(null);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading verifications...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Verification Centre</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {records.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border text-gray-500">No pending verifications.</div>
          ) : (
            records.map((record) => (
              <button
                key={record.userId}
                onClick={() => setSelected(record)}
                className={`w-full text-left bg-white p-5 rounded-xl border hover:shadow-md ${
                  selected?.userId === record.userId ? 'ring-2 ring-brand-green' : ''
                }`}
              >
                <p className="font-bold text-lg">{record.firstName} {record.lastName}</p>
                <p className="text-sm text-gray-500">{record.user.email} • {record.skills.join(', ')}</p>
                <span className="inline-block mt-2 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  {record.verificationStatus}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          {selected ? (
            <>
              <h2 className="text-xl font-bold mb-4">{selected.firstName} {selected.lastName}</h2>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Email:</span> {selected.user.email}</p>
                <p><span className="text-gray-500">Phone:</span> {selected.user.phoneNumber}</p>
                <p><span className="text-gray-500">NIN:</span> {selected.ninNumber || 'Not provided'}</p>
                <p><span className="text-gray-500">Portfolio:</span> {selected.portfolioUrls.length} items</p>
                <p><span className="text-gray-500">References:</span> {selected.references.length}</p>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Rejection reason (if rejecting)</label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-lg text-sm"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <button onClick={() => act('review')} className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold">
                  Mark Under Review
                </button>
                <button onClick={() => act('approve')} className="w-full bg-brand-green text-white py-2 rounded-lg font-bold">
                  Approve
                </button>
                <button onClick={() => act('reject')} className="w-full bg-red-600 text-white py-2 rounded-lg font-bold">
                  Reject
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-20">Select an artisan to review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
