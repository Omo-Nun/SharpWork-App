'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { connectSocket, disconnectSocket, sendChatMessage, joinBookingRoom } from '../lib/socket';
import { fetchBookingMessages, fetchBooking, type ChatMessage } from '../lib/marketplace';
import { apiPost } from '../lib/api';
import { getAccessToken } from '../lib/auth-storage';

export function ChatInterface({ bookingId, currentRole }: { bookingId: string, currentRole: 'CUSTOMER' | 'ARTISAN' }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: booking, refetch: refetchBooking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    refetchInterval: 10000,
  });

  const { data: initialMessages } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => fetchBookingMessages(bookingId),
    enabled: !!booking && booking.chatOpen,
  });

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!booking?.chatOpen) return;

    const socket = connectSocket();
    if (!socket) return;

    joinBookingRoom(bookingId);

    const onMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, createdAt: msg.timestamp || new Date().toISOString() }];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    socket.on('chat:message', onMessage);

    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [booking?.chatOpen, bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const otherParty = currentRole === 'CUSTOMER' ? booking?.artisan : booking?.customer;
  const otherName = otherParty ? (currentRole === 'CUSTOMER' ? (otherParty as any).artisanProfile?.firstName : (otherParty as any).customerProfile?.firstName) : 'Loading...';

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !otherParty || !booking?.chatOpen) return;

    setSending(true);
    try {
      sendChatMessage(bookingId, otherParty.id, input);
      setInput('');
    } finally {
      setSending(false);
    }
  }

  // Artisan action: send quote
  const [quotePrice, setQuotePrice] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  async function handleSendQuote() {
    if (!quotePrice || isNaN(Number(quotePrice)) || Number(quotePrice) < 1000) {
      alert('Valid quote must be at least ₦1,000');
      return;
    }
    setSendingQuote(true);
    try {
      // Create quote via system message
      await apiPost('/booking/' + bookingId + '/quote', { price: Number(quotePrice) }, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      sendChatMessage(bookingId, otherParty!.id, `[SYSTEM:QUOTE] I have sent a quote for ₦${Number(quotePrice).toLocaleString()}`);
      setQuotePrice('');
    } catch (err) {
      alert('Failed to send quote');
    } finally {
      setSendingQuote(false);
    }
  }

  if (!booking) return <div className="p-8 text-center animate-pulse text-gray-500">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center font-bold text-brand-navy">
            {otherName?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{otherName}</h2>
            <p className="text-xs text-brand-green font-medium">
              {booking.state === 'PENDING' ? 'Inquiry Phase' : booking.state}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
        {/* Booking Context Card */}
        <div className="bg-white p-4 rounded-2xl border border-brand-green/20 shadow-sm max-w-[85%] mx-auto">
          <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Service Inquiry</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.description}</p>
          {(booking as any).mediaUrls && (booking as any).mediaUrls.length > 0 && (
            <div className="flex gap-2 mt-3">
              {(booking as any).mediaUrls.map((url: string, i: number) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={url} alt="Attached" fill unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {messages.map((m) => {
          const isMine = currentRole === 'CUSTOMER' ? m.senderId !== (booking as any).artisanId : m.senderId === (booking as any).artisanId;
          const isSystem = m.content.startsWith('[SERVICE INQUIRY]') || m.content.startsWith('[SYSTEM:QUOTE]');
          
          if (isSystem) {
             if (m.content.startsWith('[SYSTEM:QUOTE]')) {
               const priceMatch = m.content.match(/₦([\d,]+)/);
               const quoteAmount = priceMatch ? priceMatch[1] : '';
               return (
                 <div key={m.id} className="flex justify-center my-4">
                    <div className="bg-gradient-to-br from-brand-navy to-gray-900 text-white p-5 rounded-2xl max-w-sm w-full shadow-lg text-center">
                      <p className="text-sm text-gray-300 font-medium mb-1">Final Quote Received</p>
                      <p className="text-3xl font-black mb-4">₦{quoteAmount}</p>
                      {currentRole === 'CUSTOMER' && booking.paymentStatus === 'PENDING' && (
                        <button 
                          onClick={async () => {
                            try {
                              const res = await apiPost('/booking/' + bookingId + '/checkout', {}, {
                                headers: { Authorization: `Bearer ${getAccessToken()}` }
                              });
                              if ((res as any).authorization_url) {
                                window.location.href = (res as any).authorization_url;
                              }
                            } catch (err: any) {
                              console.error(err);
                              alert(err.message || 'Payment initiation failed.');
                            }
                          }}
                          className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow"
                        >
                          Pay to Escrow
                        </button>
                      )}
                    </div>
                 </div>
               );
             }
             return null; // Don't render raw inquiry again, we have the card above
          }

          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMine ? 'bg-brand-green text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'}`}>
                {m.content}
                <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {!booking.chatOpen ? (
          <div className="text-center p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            Chat is closed for this booking.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border-none rounded-full px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
            />
            {currentRole === 'ARTISAN' && booking.paymentStatus === 'PENDING' && (
              <div className="absolute -top-16 left-0 right-0 flex gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-xl animate-in slide-in-from-bottom-2">
                <input 
                  type="number" 
                  value={quotePrice} 
                  onChange={e => setQuotePrice(e.target.value)} 
                  placeholder="Final Quote (₦)" 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
                <button 
                  type="button" 
                  onClick={handleSendQuote}
                  disabled={sendingQuote}
                  className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
                >
                  Send Quote
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-brand-green text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-emerald-500 hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
