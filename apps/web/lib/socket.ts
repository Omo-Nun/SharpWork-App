import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';
import { getAccessToken } from './auth-storage';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function reconnectSocket() {
  disconnectSocket();
  return connectSocket();
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinBookingRoom(bookingId: string) {
  socket?.emit('join:booking', bookingId);
}

export function sendChatMessage(bookingId: string, receiverId: string, content: string) {
  socket?.emit('chat:message', { bookingId, receiverId, content });
}

export function sendLocationUpdate(bookingId: string, lat: number, lng: number) {
  socket?.emit('location:update', { bookingId, lat, lng });
}
