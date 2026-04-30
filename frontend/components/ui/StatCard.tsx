'use client';

import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  change?: string;
  up?: boolean;
}

export function StatCard({ label, value, color = 'text-white', change, up }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className={clsx('font-head text-2xl font-extrabold mb-1', color)}>{value}</div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      {change && (
        <div className={clsx('flex items-center gap-1 text-xs', up ? 'text-green-400' : 'text-gray-500')}>
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'green' | 'gold' | 'red' | 'gray';
}

const BADGE_VARIANTS = {
  purple: 'bg-purple-500/15 text-purple-300',
  green: 'bg-green-500/15 text-green-400',
  gold: 'bg-yellow-500/15 text-yellow-400',
  red: 'bg-red-500/15 text-red-400',
  gray: 'bg-white/8 text-gray-400',
};

export function Badge({ children, variant = 'purple' }: BadgeProps) {
  return (
    <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', BADGE_VARIANTS[variant])}>
      {children}
    </span>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────
interface StatusPillProps {
  status: 'open' | 'locked' | 'sold' | 'pending' | 'rejected';
}

const STATUS_CONFIG = {
  open: { label: 'Open', class: 'bg-green-500/15 text-green-400' },
  locked: { label: 'Locked', class: 'bg-yellow-500/15 text-yellow-400' },
  sold: { label: 'Sold', class: 'bg-purple-500/15 text-purple-300' },
  pending: { label: 'Pending', class: 'bg-white/8 text-gray-400' },
  rejected: { label: 'Rejected', class: 'bg-red-500/15 text-red-400' },
};

export function StatusPill({ status }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', cfg.class)}>
      {cfg.label}
    </span>
  );
}

// ── LoadingSkeleton ───────────────────────────────────────────────────────────
export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 card animate-pulse">
          <div className="h-4 bg-white/5 rounded flex-1" />
          <div className="h-4 bg-white/5 rounded w-24" />
          <div className="h-4 bg-white/5 rounded w-20" />
          <div className="h-4 bg-white/5 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

// ── IntentBar ─────────────────────────────────────────────────────────────────
export function IntentBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-purple-300 w-8">{score}</span>
    </div>
  );
}

// ── Toast provider placeholder ────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
