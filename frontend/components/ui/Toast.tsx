'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  icon?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, icon?: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, icon = '✅', variant: Toast['variant'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, icon, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const VARIANT_STYLES = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    info: 'border-purple-500/20',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'bg-surface-2 border rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm min-w-[280px] animate-slide-in shadow-xl',
              VARIANT_STYLES[t.variant || 'success']
            )}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
