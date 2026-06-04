'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

export function useSocket(events?: Record<string, (data: unknown) => void>) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const handlers: Array<[string, (data: unknown) => void]> = [];

    if (eventsRef.current) {
      for (const [event, handler] of Object.entries(eventsRef.current)) {
        const wrapped = (data: unknown) => handler(data);
        socket.on(event, wrapped);
        handlers.push([event, wrapped]);
      }
    }

    return () => {
      for (const [event, handler] of handlers) {
        socket.off(event, handler);
      }
      disconnectSocket();
    };
  }, []);
}

export function useSocketConnection() {
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);
}

export { getSocket };
