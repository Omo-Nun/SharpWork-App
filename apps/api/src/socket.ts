import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from './utils/jwt';
import prisma from './prisma';
import { isChatOpenForBooking } from './lib/chat-gating';

let io: SocketIOServer;

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: string;
  };
}

async function getBookingForParticipant(bookingId: string, userId: string) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      deleted_at: null,
      OR: [{ customerId: userId }, { artisanId: userId }],
    },
    select: { id: true, state: true },
  });
}

async function isBookingParticipant(bookingId: string, userId: string): Promise<boolean> {
  const booking = await getBookingForParticipant(bookingId, userId);
  return Boolean(booking);
}

export function initSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }

    try {
      const decoded = verifyAccessToken(token) as { userId: string; role: string };
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    socket.on('join:booking', async (bookingId: string) => {
      if (!bookingId || !(await isBookingParticipant(bookingId, userId))) {
        return;
      }
      socket.join(`booking:${bookingId}`);
    });

    socket.on('chat:message', async (data: { bookingId: string; receiverId: string; content: string }) => {
      const content = typeof data.content === 'string' ? data.content.trim() : '';
      if (!data.bookingId || !data.receiverId || content.length < 1 || content.length > 2000) {
        return;
      }

      const booking = await getBookingForParticipant(data.bookingId, userId);
      if (!booking) {
        return;
      }

      if (!isChatOpenForBooking(booking.state)) {
        socket.emit('chat:error', {
          code: 'CHAT_CLOSED',
          message: 'Chat is only available after the artisan accepts and before job completion.',
        });
        return;
      }

      try {
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: data.receiverId,
            bookingId: data.bookingId,
            content,
          },
        });

        const payload = {
          id: message.id,
          bookingId: data.bookingId,
          senderId: userId,
          receiverId: data.receiverId,
          content,
          timestamp: message.createdAt.toISOString(),
        };

        io.to(`booking:${data.bookingId}`).emit('chat:message', payload);
      } catch (error) {
        console.error('[Socket.io] chat:message error:', error);
      }
    });

    socket.on('location:update', async (data: { bookingId: string; lat: number; lng: number }) => {
      if (!data.bookingId || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
        return;
      }

      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          artisanId: userId,
          state: 'IN_PROGRESS',
          deleted_at: null,
        },
      });

      if (!booking) {
        return;
      }

      io.to(`booking:${data.bookingId}`).emit('location:update', {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
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

export function emitToUser(userId: string, event: string, data: unknown) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToBooking(bookingId: string, event: string, data: unknown) {
  if (io) {
    io.to(`booking:${bookingId}`).emit(event, data);
  }
}
