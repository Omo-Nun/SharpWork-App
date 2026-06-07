'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OpenStreetMap } from '../../../../components/OpenStreetMap';
import { useAuth } from '../../../../context/AuthContext';
import { chatStatusMessage, isChatOpen } from '../../../../lib/chat-gating';
import {
  fetchBooking,
  fetchBookingMessages,
  type ChatMessage,
} from '../../../../lib/marketplace';
import {
  connectSocket,
  joinBookingRoom,
  sendChatMessage,
} from '../../../../lib/socket';

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
}

const STEPS = [
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REVIEWED', label: 'Reviewed' }
];

function JobTimeline({ currentState }: { currentState: string }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentState);
  const activeIndex = currentIndex === -1 ? (currentState === 'PENDING' ? -1 : 0) : currentIndex;
  
  return (
    <div className="flex items-center w-full max-w-3xl mx-auto py-6 px-4 bg-white border-b shadow-sm relative z-20">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex-1 flex flex-col items-center relative">
          {idx !== 0 && (
            <div className={`absolute top-4 left-[-50%] right-[50%] h-1 ${idx <= activeIndex ? 'bg-[#007A52]' : 'bg-gray-200'}`} />
          )}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 font-bold text-sm transition-colors ${idx < activeIndex ? 'bg-[#007A52] border-[#007A52] text-white' : idx === activeIndex ? 'bg-white border-[#007A52] text-[#007A52] ring-4 ring-[#007A52]/20' : 'bg-white border-gray-300 text-gray-300'}`}>
            {idx < activeIndex ? '✓' : idx + 1}
          </div>
          <span className={`mt-3 text-xs font-bold ${idx <= activeIndex ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function JobTrackingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [locationStatus, setLocationStatus] = useState('Waiting for artisan location...');
  const [coords, setCoords] = useState<LocationUpdate | null>(null);
  const [bookingState, setBookingState] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatError, setChatError] = useState('');
  const [peerId, setPeerId] = useState('');
  const [peerName, setPeerName] = useState('Artisan');
  const [loadError, setLoadError] = useState('');

  const dashboardPath = user?.role === 'ARTISAN' ? '/dashboard/artisan' : '/dashboard/customer';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(`/job/${jobId}/tracking`)}`);
    }
  }, [authLoading, user, router, jobId]);

  useEffect(() => {
    if (!user) return;

    fetchBooking(jobId)
      .then((booking) => {
        const isCustomer = user.id === booking.customer?.id;
        const isArtisan = user.id === booking.artisan?.id;
        if (!isCustomer && !isArtisan) {
          setLoadError('You do not have access to this job.');
          return;
        }

        setBookingState(booking.state);
        setPaymentStatus(booking.paymentStatus);
        setChatOpen(booking.chatOpen ?? isChatOpen(booking.state));

        const peer = isCustomer ? booking.artisan : booking.customer;
        setPeerId(peer?.id || '');
        const profile = isCustomer ? booking.artisan?.artisanProfile : booking.customer?.customerProfile;
        setPeerName(profile ? `${profile.firstName} ${profile.lastName}` : 'Participant');

        if (booking.chatOpen ?? isChatOpen(booking.state)) {
          return fetchBookingMessages(jobId).then(setMessages);
        }
        return undefined;
      })
      .catch(() => setLoadError('Unable to load booking'));
  }, [jobId, user]);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();
    if (!socket) return;

    joinBookingRoom(jobId);

    const onLocation = (data: LocationUpdate) => {
      setCoords(data);
      setLocationStatus(`Artisan at ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`);
    };

    const onMessage = (data: ChatMessage & { timestamp?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || `${Date.now()}`,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        },
      ]);
    };

    const onStateChanged = (data: { state: string }) => {
      setBookingState(data.state);
      const open = isChatOpen(data.state);
      setChatOpen(open);
      if (!open) {
        setShowChat(false);
        setChatError('Chat closed — this job is complete.');
      }
    };

    const onChatError = (data: { code?: string; message?: string }) => {
      setChatError(data.message || 'Unable to send message.');
    };

    socket.on('location:update', onLocation);
    socket.on('chat:message', onMessage);
    socket.on('booking:state_changed', onStateChanged);
    socket.on('chat:error', onChatError);

    return () => {
      socket.off('location:update', onLocation);
      socket.off('chat:message', onMessage);
      socket.off('booking:state_changed', onStateChanged);
      socket.off('chat:error', onChatError);
    };
  }, [jobId, user]);

  const handleSendMessage = () => {
    if (!chatOpen || !messageInput.trim() || !peerId || !user) return;
    setChatError('');
    sendChatMessage(jobId, peerId, messageInput.trim());
    setMessageInput('');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-red-600 mb-4">{loadError}</p>
        <Link href={dashboardPath} className="text-brand-green font-bold">← Back to dashboard</Link>
      </div>
    );
  }

  const statusMessage = chatStatusMessage(bookingState, paymentStatus);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link href={dashboardPath} className="text-[#0D2B5E] hover:underline font-medium">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Job Tracking</h1>
        </div>
        <div className="flex items-center gap-2">
          {bookingState === 'IN_PROGRESS' && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#007A52]" />
              </span>
              <span className="text-sm font-bold text-[#007A52] bg-green-50 px-3 py-1 rounded-full border border-green-100">Live • Tracking</span>
            </>
          )}
        </div>
      </div>

      <JobTimeline currentState={bookingState} />

      <div className="flex-1 relative bg-gray-200">
        {bookingState === 'IN_PROGRESS' && coords ? (
          <OpenStreetMap
            lat={coords.lat}
            lng={coords.lng}
            className="absolute inset-0 w-full h-full"
            label={`Artisan location • ${bookingState}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-lg font-medium text-gray-700">
              {bookingState === 'IN_PROGRESS' ? locationStatus : statusMessage}
            </p>
            {bookingState === 'IN_PROGRESS' && (
              <p className="text-sm text-gray-400 mt-4 max-w-md">
                Live coordinates stream via Socket.io when the artisan is en route.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-t-2xl px-6 py-6 border-t z-10 -mt-4 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{peerName}</h2>
            <p className="text-sm text-[#007A52] font-medium mt-1">{statusMessage}</p>
          </div>
        </div>

        {chatError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {chatError}
          </div>
        )}

        {showChat && chatOpen && (
          <div className="mb-4 border rounded-xl p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col gap-3 scrollbar-hide shadow-inner">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center m-auto">No messages yet. Say hello to coordinate the job.</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-[#0D2B5E] text-white rounded-2xl rounded-br-sm' : 'bg-white border text-gray-800 rounded-2xl rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1 font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {showChat && chatOpen && (
          <div className="flex gap-2 mb-4">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="bg-brand-green text-white px-4 rounded-lg font-bold text-sm">
              Send
            </button>
          </div>
        )}

        <div className="border-t pt-4 flex gap-4">
          {chatOpen ? (
            <button
              onClick={() => setShowChat((v) => !v)}
              className="flex-1 bg-[#0D2B5E] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#0D2B5E]/90"
            >
              {showChat ? 'Hide Chat' : 'Open Chat'}
            </button>
          ) : (
            <p className="flex-1 text-center text-sm text-gray-500 py-3">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
