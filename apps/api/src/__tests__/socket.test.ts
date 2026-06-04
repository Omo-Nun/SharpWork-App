import jwt from 'jsonwebtoken';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { initSocketIO } from '../socket';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_ACCESS_SECRET';

function makeToken(userId: string, role = 'CUSTOMER') {
  return jwt.sign({ userId, role }, ACCESS_SECRET);
}

describe('Socket.io Module', () => {
  let httpServer: HttpServer;
  let port: number;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    httpServer = createServer();
    initSocketIO(httpServer);
    httpServer.listen(0, () => {
      port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`, {
        auth: { token: makeToken('user123') },
        transports: ['websocket'],
      });
      clientSocket.on('connect', () => done());
      clientSocket.on('connect_error', (err) => done(new Error(err.message)));
    });
  }, 10000);

  afterAll((done) => {
    clientSocket.close();
    httpServer.close(() => done());
  });

  it('connects with a valid JWT', () => {
    expect(clientSocket.connected).toBe(true);
  });

  it('rejects unauthenticated connections', (done) => {
    const badClient = Client(`http://localhost:${port}`, { transports: ['websocket'] });
    badClient.on('connect_error', (err) => {
      expect(err.message).toBe('Unauthorized');
      badClient.close();
      done();
    });
  });
});
