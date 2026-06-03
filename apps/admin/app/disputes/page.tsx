'use client';

import { useState } from 'react';

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';

interface Dispute {
  id: string;
  reason: string;
  status: DisputeStatus;
  escrowFrozen: boolean;
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

// Mock data for scaffolding
const mockDisputes: Dispute[] = [
  {
    id: 'd-001',
    reason: 'Artisan did not complete the job. Bathroom still leaking.',
    status: 'OPEN',
    escrowFrozen: true,
    createdAt: '2026-05-30T10:00:00Z',
    booking: { id: 'b-101', description: 'Fix bathroom leak', price: 15000, customer: { email: 'john@email.com' }, artisan: { email: 'jane@email.com' } },
    raisedBy: { email: 'john@email.com' },
  },
  {
    id: 'd-002',
    reason: 'Customer claims work was not done but artisan has photo evidence.',
    status: 'ESCALATED',
    escrowFrozen: true,
    createdAt: '2026-05-29T14:00:00Z',
    booking: { id: 'b-099', description: 'Electrical rewiring', price: 45000, customer: { email: 'mike@email.com' }, artisan: { email: 'tom@email.com' } },
    raisedBy: { email: 'mike@email.com' },
  },
  {
    id: 'd-003',
    reason: 'Overcharging — agreed ₦10,000 but billed ₦18,000.',
    status: 'UNDER_REVIEW',
    escrowFrozen: true,
    createdAt: '2026-05-28T09:30:00Z',
    booking: { id: 'b-095', description: 'Paint living room', price: 18000, customer: { email: 'ada@email.com' }, artisan: { email: 'chidi@email.com' } },
    raisedBy: { email: 'ada@email.com' },
  },
];

export default function DisputeCentre() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dispute Centre</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispute List */}
        <div className="lg:col-span-2 space-y-4">
          {mockDisputes.map((dispute) => (
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
                <span>Booking: {dispute.booking.id}</span>
                <span>Amount: ₦{dispute.booking.price.toLocaleString()}</span>
                {dispute.escrowFrozen && <span className="text-red-500 font-bold">🔒 ESCROW FROZEN</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {selectedDispute ? (
            <>
              <h2 className="text-xl font-bold mb-4">Dispute Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Dispute ID:</span>
                  <span className="ml-2 font-mono">{selectedDispute.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Customer:</span>
                  <span className="ml-2">{selectedDispute.booking.customer.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Artisan:</span>
                  <span className="ml-2">{selectedDispute.booking.artisan.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="ml-2 font-bold">₦{selectedDispute.booking.price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Escrow:</span>
                  <span className={`ml-2 font-bold ${selectedDispute.escrowFrozen ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedDispute.escrowFrozen ? 'Frozen' : 'Released'}
                  </span>
                </div>
              </div>

              <div className="border-t mt-6 pt-4">
                <h3 className="font-bold mb-2">Admin Notes</h3>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm outline-brand-green"
                  rows={3}
                  placeholder="Add your mediation notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
                  Mark Under Review
                </button>
                <button className="w-full bg-brand-green text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">
                  Resolve & Release Escrow
                </button>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  Escalate
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-center py-20">
              <p>Select a dispute from the list to view details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
