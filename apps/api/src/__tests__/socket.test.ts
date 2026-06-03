import { Server } from 'socket.io';
import { createServer } from 'http';
import { initSocketIO, getIO, emitToUser, emitToBooking } from '../socket';
import { io as Client } from 'socket.io-client';

describe('Socket.io Module', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: any;
  let httpServer: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = initSocketIO(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it('should initialize and return the IO instance', () => {
    expect(getIO()).toBeDefined();
  });

  it('should allow user to join a personal room', (done) => {
    clientSocket.emit('join', 'user123');
    setTimeout(() => {
      expect(serverSocket.rooms.has('user:user123')).toBe(true);
      done();
    }, 50);
  });

  it('should allow user to join a booking room', (done) => {
    clientSocket.emit('join:booking', 'booking123');
    setTimeout(() => {
      expect(serverSocket.rooms.has('booking:booking123')).toBe(true);
      done();
    }, 50);
  });

  it('should handle chat:message events', (done) => {
    clientSocket.emit('join:booking', 'booking456');
    clientSocket.on('chat:message', (data: any) => {
      expect(data.content).toBe('Hello');
      expect(data.senderId).toBe('artisan1');
      done();
    });

    setTimeout(() => {
      clientSocket.emit('chat:message', { bookingId: 'booking456', senderId: 'artisan1', content: 'Hello' });
    }, 50);
  });

  it('should handle location:update events', (done) => {
    clientSocket.emit('join:booking', 'booking789');
    clientSocket.on('location:update', (data: any) => {
      expect(data.lat).toBe(6.5244);
      expect(data.lng).toBe(3.3792);
      done();
    });

    setTimeout(() => {
      clientSocket.emit('location:update', { bookingId: 'booking789', lat: 6.5244, lng: 3.3792 });
    }, 50);
  });
});
