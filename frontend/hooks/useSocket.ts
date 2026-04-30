'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/lib/store';

let globalSocket: Socket | null = null;

export function useSocket() {
  const { token, user, setCredits } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Reuse existing connection
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('credits:added', ({ credits, total }) => {
      setCredits(total);
    });

    socket.on('credits:refunded', ({ credits }) => {
      useAuthStore.getState().refreshCredits();
    });

    globalSocket = socket;
    socketRef.current = socket;

    return () => {
      // Don't disconnect on component unmount — keep persistent connection
    };
  }, [token]);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler);
  }, []);

  return { socket: socketRef.current, on, off };
}

export { globalSocket };
