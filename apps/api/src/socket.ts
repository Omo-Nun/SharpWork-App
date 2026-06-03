import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a personal room based on userId
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.io] User ${userId} joined room user:${userId}`);
    });

    // Join a booking-specific room for real-time updates
    socket.on('join:booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined booking:${bookingId}`);
    });

    // Chat message within a booking
    socket.on('chat:message', (data: { bookingId: string; senderId: string; content: string }) => {
      io.to(`booking:${data.bookingId}`).emit('chat:message', {
        senderId: data.senderId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    });

    // Location update from artisan during IN_PROGRESS
    socket.on('location:update', (data: { bookingId: string; lat: number; lng: number }) => {
      io.to(`booking:${data.bookingId}`).emit('location:update', {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocketIO first.');
  }
  return io;
}

/**
 * Emit a real-time notification to a specific user.
 */
export function emitToUser(userId: string, event: string, data: unknown) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit a real-time update to all participants in a booking room.
 */
export function emitToBooking(bookingId: string, event: string, data: unknown) {
  if (io) {
    io.to(`booking:${bookingId}`).emit(event, data);
  }
}
