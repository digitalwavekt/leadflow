'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/lib/store';

let globalSocket: Socket | null = null;

export function useSocket() {
  const { token, setCredits } = useAuthStore();
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
      // BUG FIX: join designer room on connect so lead:new events are received
      socket.emit('join_designers_room');
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('credits:added', ({ total }: { credits: number; total: number }) => {
      setCredits(total);
    });

    socket.on('credits:refunded', () => {
      useAuthStore.getState().refreshCredits();
    });

    globalSocket = socket;
    socketRef.current = socket;

    return () => {
      // Don't disconnect on component unmount — keep persistent connection
    };
  }, [token]);

  // BUG FIX: always use globalSocket (not stale socketRef) so events attach
  // even if the hook is called before socket connects
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const sock = globalSocket || socketRef.current;
    if (!sock) return () => {};
    sock.on(event, handler);
    return () => sock.off(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    const sock = globalSocket || socketRef.current;
    sock?.off(event, handler);
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    const sock = globalSocket || socketRef.current;
    sock?.emit(event, ...args);
  }, []);

  return { socket: globalSocket || socketRef.current, on, off, emit };
}

export { globalSocket };
