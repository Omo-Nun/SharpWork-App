'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  agreePartialRelease,
  confirmBookingCompletion,
  fetchMyBookings,
  raiseBookingDispute,
  requestPartialRelease,
  updateBookingState,
  type BookingRecord,
} from '../lib/marketplace';
import { isChatOpen } from '../lib/chat-gating';
import { useSocketConnection } from '../hooks/useSocket';
import { useArtisanLocationPublisher } from '../hooks/useArtisanLocation';
import { getSocket } from '../lib/socket';

function paymentLabel(status: string, escrowReleased?: boolean, escrowReleasedAmount?: number) {
  if (status === 'PAID' && escrowReleasedAmount && escrowReleasedAmount > 0 && !escrowReleased) {
    return 'Partially released';
  }
  if (status === 'PAID' && !escrowReleased) return 'In escrow';
  if (status === 'PAID' && escrowReleased) return 'Released';
  if (status === 'PENDING') return 'Awaiting payment';
  return status;
}

function paymentBadgeClass(status: string, escrowReleased?: boolean) {
  if (status === 'PAID' && !escrowReleased) return 'bg-amber-50 text-amber-700';
  if (status === 'PAID') return 'bg-green-50 text-green-700';
  return 'bg-gray-100 text-gray-600';
}

function artisanName(booking: BookingRecord) {
  const p = booking.artisan?.artisanProfile;
  return p ? `${p.firstName} ${p.lastName}` : 'Artisan';
}

function customerName(booking: BookingRecord) {
  const p = booking.customer?.customerProfile;
  return p ? `${p.firstName} ${p.lastName}` : 'Customer';
}

function DisputeModal({
  onClose,
  onSubmit,
}: {
  bookingId: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Raise a dispute</h3>
        <p className="text-sm text-gray-500 mb-4">Available within 48 hours of the artisan marking the job complete.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue..."
          className="w-full border rounded-lg p-3 text-sm mb-4"
          rows={4}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border font-bold">Cancel</button>
          <button
            disabled={loading || reason.trim().length < 10}
            onClick={async () => {
              setLoading(true);
              await onSubmit(reason.trim());
              setLoading(false);
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50"
          >
            Submit Dispute
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({
  onClose,
  onSubmit,
}: {
  bookingId: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Rate your artisan</h3>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment..."
          className="w-full border rounded-lg p-3 text-sm mb-4"
          rows={3}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border font-bold">Cancel</button>
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onSubmit(rating, comment);
              setLoading(false);
            }}
            className="flex-1 py-2 rounded-lg bg-brand-green text-white font-bold disabled:opacity-50"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomerBookingsPanel() {
  const queryClient = useQueryClient();
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: fetchMyBookings,
  });

  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] });
  }, [queryClient]);

  useSocketConnection();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => reload();
    socket.on('booking:state_changed', refresh);
    socket.on('booking:paid', refresh);
    return () => {
      socket.off('booking:state_changed', refresh);
      socket.off('booking:paid', refresh);
    };
  }, [reload]);

  const stats = {
    active: bookings.filter((b) => !['COMPLETED', 'REVIEWED'].includes(b.state)).length,
    completed: bookings.filter((b) => ['REVIEWED', 'COMPLETED'].includes(b.state)).length,
    spent: bookings.filter((b) => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.price, 0),
  };

  return (
    <>
      {disputeBookingId && (
        <DisputeModal
          bookingId={disputeBookingId}
          onClose={() => setDisputeBookingId(null)}
          onSubmit={async (reason) => {
            setActionError('');
            try {
              await raiseBookingDispute(disputeBookingId, reason);
              setDisputeBookingId(null);
              reload();
            } catch {
              setActionError('Failed to raise dispute');
            }
          }}
        />
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          onClose={() => setReviewBookingId(null)}
          onSubmit={async (rating, comment) => {
            await updateBookingState(reviewBookingId, 'REVIEWED', { rating, comment });
            setReviewBookingId(null);
            reload();
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Active Bookings</h3>
          <p className="text-4xl font-black text-brand-navy">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Completed Jobs</h3>
          <p className="text-4xl font-black text-brand-navy">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Total Spent</h3>
          <p className="text-4xl font-black text-brand-navy">₦ {stats.spent.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brand-navy">Your Bookings</h2>
        <Link href="/search" className="text-brand-green font-bold hover:underline">Find artisan →</Link>
      </div>

      {isLoading && <p className="text-gray-500">Loading bookings...</p>}

      {!isLoading && bookings.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border text-center text-gray-500 mb-12">
          No bookings yet. <Link href="/search" className="text-brand-green font-bold">Find an artisan</Link>
        </div>
      )}

      <div className="space-y-4 mb-12">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-brand-navy">{booking.description.slice(0, 60)}...</h3>
              <p className="text-gray-500">{artisanName(booking)} • ₦{booking.price.toLocaleString()}</p>
              {booking.categorySlugs && booking.categorySlugs.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{booking.categorySlugs.join(' · ')}</p>
              )}
              <p className="text-sm text-gray-400">{booking.serviceAddress || 'No address'}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${paymentBadgeClass(booking.paymentStatus, booking.escrowReleased)}`}>
                {paymentLabel(booking.paymentStatus, booking.escrowReleased, booking.escrowReleasedAmount)}
              </span>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase">{booking.state}</span>
              {(booking.chatOpen ?? isChatOpen(booking.state)) && (
                <Link href={`/job/${booking.id}/tracking`} className="text-brand-green font-bold text-sm">
                  Track &amp; Chat
                </Link>
              )}
              {booking.state === 'PENDING' && booking.paymentStatus === 'PAID' && (
                <span className="text-xs text-gray-400">Awaiting artisan accept</span>
              )}
              {booking.canConfirmCompletion && (
                <button
                  onClick={async () => {
                    setActionError('');
                    try {
                      await confirmBookingCompletion(booking.id);
                      reload();
                    } catch {
                      setActionError('Failed to confirm completion');
                    }
                  }}
                  className="text-white bg-brand-green px-4 py-1.5 rounded-full text-sm font-bold"
                >
                  Confirm Job Done
                </button>
              )}
              {booking.pendingPartialPercent && (
                <button
                  onClick={async () => {
                    setActionError('');
                    try {
                      await agreePartialRelease(booking.id);
                      reload();
                    } catch {
                      setActionError('Failed to agree to partial release');
                    }
                  }}
                  className="text-brand-navy border border-brand-navy px-3 py-1.5 rounded-full text-sm font-bold"
                >
                  Agree {booking.pendingPartialPercent}% Release
                </button>
              )}
              {booking.canDispute && (
                <button onClick={() => setDisputeBookingId(booking.id)} className="text-red-600 font-bold text-sm">
                  Dispute
                </button>
              )}
              {booking.state === 'COMPLETED' && booking.escrowReleased && (
                <button onClick={() => setReviewBookingId(booking.id)} className="text-brand-orange font-bold text-sm">Leave Review</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ArtisanBookingsPanel() {
  const queryClient = useQueryClient();
  const [partialBookingId, setPartialBookingId] = useState<string | null>(null);
  const [partialPercent, setPartialPercent] = useState<20 | 50 | 75>(50);
  const [actionError, setActionError] = useState('');
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: fetchMyBookings,
  });

  const inProgress = bookings.find((b) => b.state === 'IN_PROGRESS');
  useArtisanLocationPublisher(inProgress?.id, Boolean(inProgress));

  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] });
  }, [queryClient]);

  useSocketConnection();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => reload();
    socket.on('booking:created', refresh);
    socket.on('booking:paid', refresh);
    socket.on('booking:state_changed', refresh);
    return () => {
      socket.off('booking:created', refresh);
      socket.off('booking:paid', refresh);
      socket.off('booking:state_changed', refresh);
    };
  }, [reload]);

  const pending = bookings.filter((b) => b.state === 'PENDING' && b.paymentStatus === 'PAID');
  const active = bookings.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.state));
  const awaitingRelease = bookings.filter(
    (b) => b.state === 'COMPLETED' && !b.escrowReleased
  );

  const changeState = async (id: string, state: string) => {
    await updateBookingState(id, state);
    reload();
  };

  const requestPartial = async () => {
    if (!partialBookingId) return;
    setActionError('');
    try {
      await requestPartialRelease(partialBookingId, partialPercent);
      setPartialBookingId(null);
      reload();
    } catch {
      setActionError('Failed to request partial release');
    }
  };

  return (
    <div className="mb-12 space-y-8">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {partialBookingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Request partial release</h3>
            <p className="text-sm text-gray-500 mb-4">Customer must agree before funds are released.</p>
            <div className="flex gap-2 mb-4">
              {([20, 50, 75] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPartialPercent(p)}
                  className={`flex-1 py-2 rounded-lg font-bold border ${partialPercent === p ? 'bg-brand-green text-white border-brand-green' : ''}`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPartialBookingId(null)} className="flex-1 py-2 rounded-lg border font-bold">Cancel</button>
              <button onClick={requestPartial} className="flex-1 py-2 rounded-lg bg-brand-navy text-white font-bold">Send Request</button>
            </div>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-6">Incoming Job Requests</h2>
        {pending.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-gray-500">No pending paid requests.</div>
        ) : (
          <div className="space-y-4">
            {pending.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-brand-navy">{customerName(booking)}</p>
                  <p className="text-gray-500 text-sm">{booking.description.slice(0, 80)}</p>
                  {booking.categorySlugs && booking.categorySlugs.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{booking.categorySlugs.join(' · ')}</p>
                  )}
                  <p className="text-brand-green font-bold">₦{booking.price.toLocaleString()}</p>
                </div>
                <button onClick={() => changeState(booking.id, 'ACCEPTED')} className="bg-brand-green text-white px-5 py-2 rounded-xl font-bold">
                  Accept Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-6">Active Jobs</h2>
        {active.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-gray-500">No active jobs.</div>
        ) : (
          <div className="space-y-4">
            {active.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-brand-navy">{booking.description.slice(0, 60)}</p>
                  <p className="text-sm text-gray-500 uppercase">{booking.state}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(booking.chatOpen ?? isChatOpen(booking.state)) && (
                    <Link href={`/job/${booking.id}/tracking`} className="text-brand-green font-bold text-sm">
                      Message
                    </Link>
                  )}
                  {booking.state === 'ACCEPTED' && (
                    <button onClick={() => changeState(booking.id, 'IN_PROGRESS')} className="bg-brand-navy text-white px-4 py-2 rounded-xl font-bold text-sm">
                      Start Job
                    </button>
                  )}
                  {booking.state === 'IN_PROGRESS' && (
                    <>
                      <button onClick={() => setPartialBookingId(booking.id)} className="border border-brand-navy text-brand-navy px-4 py-2 rounded-xl font-bold text-sm">
                        Partial Release
                      </button>
                      <button onClick={() => changeState(booking.id, 'COMPLETED')} className="bg-brand-green text-white px-4 py-2 rounded-xl font-bold text-sm">
                        Mark Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-6">Awaiting Escrow Release</h2>
        {awaitingRelease.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-gray-500">No jobs awaiting escrow release.</div>
        ) : (
          <div className="space-y-4">
            {awaitingRelease.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-brand-navy">{booking.description.slice(0, 60)}</p>
                  <p className="text-sm text-gray-500">Waiting for customer confirmation or admin release</p>
                  {booking.pendingPartialPercent && (
                    <p className="text-xs text-amber-600 mt-1">Partial {booking.pendingPartialPercent}% pending customer agreement</p>
                  )}
                </div>
                <button onClick={() => setPartialBookingId(booking.id)} className="text-sm font-bold text-brand-navy border px-3 py-2 rounded-lg">
                  Request Partial
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
