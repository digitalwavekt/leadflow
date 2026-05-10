'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/lib/store';

let globalSocket: Socket | null = null;

type SocketPayload = Record<string, unknown>;

export function useSocket() {
  const { token, user, setCredits } = useAuthStore();

  const socketRef = useRef<Socket | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    if (!token) return;

    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      return;
    }

    const socket: Socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    socket.on('connect', () => {
      console.log('🔌 Socket connected');

      const userId = user?.id;

      if (userId) {
        socket.emit('join_user_room', userId);
      }

      if (user?.role === 'designer') {
        socket.emit('join_designers_room');
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('credits:added', (payload: { credits?: number; total?: number }) => {
      if (typeof payload.total === 'number') {
        setCredits(payload.total);
      }
    });

    socket.on('credits:refunded', () => {
      useAuthStore.getState().refreshCredits();
    });

    socket.on('new_notification', (notification: SocketPayload) => {
      console.log('🔔 New notification:', notification);
      setUnreadNotifications((prev) => prev + 1);
    });

    socket.on('lead:new', (lead: SocketPayload) => {
      console.log('📩 New lead:', lead);
    });

    socket.on('lead:locked', (data: SocketPayload) => {
      console.log('🔒 Lead locked:', data);
    });

    socket.on('lead:unlocked', (data: SocketPayload) => {
      console.log('🔓 Lead unlocked:', data);
    });

    socket.on('lead:sold', (data: SocketPayload) => {
      console.log('💰 Lead sold:', data);
    });

    globalSocket = socket;
    socketRef.current = socket;

    return () => {
      // keep persistent socket connection
    };
  }, [token, user, setCredits]);

  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      socketRef.current?.on(event, handler);

      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      socketRef.current?.off(event, handler);
    },
    []
  );

  const resetNotificationCount = () => {
    setUnreadNotifications(0);
  };

  return {
    socket: socketRef.current,
    on,
    off,
    unreadNotifications,
    resetNotificationCount,
  };
}

export { globalSocket };