'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Zap, Lock, Star } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';

interface Lead {
  _id: string;
  service: string;
  budgetDisplay: string;
  location: string;
  descriptionTeaser?: string;
  tags: string[];
  intentScore: number;
  quality: 'high' | 'medium' | 'low';
  status: 'open' | 'locked' | 'sold';
  creditCost: number;
  createdAt: string;
  lockExpiry?: string;
}

interface LeadCardProps {
  lead: Lead;
  onPurchased?: (leadId: string) => void;
  onLocked?: (leadId: string, lockExpiry: string) => void;
}

const QUALITY_CONFIG = {
  high: { label: 'High Quality', color: 'text-green-400', bg: 'bg-green-500/15', bar: '#4ade80' },
  medium: { label: 'Medium Quality', color: 'text-yellow-400', bg: 'bg-yellow-500/15', bar: '#fbbf24' },
  low: { label: 'Standard', color: 'text-gray-400', bg: 'bg-white/8', bar: '#555' },
};

const SERVICE_COLORS: Record<string, string> = {
  'Interior Design': 'bg-purple-500/15 text-purple-300',
  'UI/UX Design': 'bg-blue-500/15 text-blue-300',
  'Logo Design': 'bg-pink-500/15 text-pink-300',
  'Brand Identity': 'bg-orange-500/15 text-orange-300',
  '3D Visualization': 'bg-teal-500/15 text-teal-300',
  'Packaging Design': 'bg-green-500/15 text-green-300',
  'Motion Design': 'bg-red-500/15 text-red-300',
};

export function LeadCard({ lead, onPurchased, onLocked }: LeadCardProps) {
  const { user } = useAuthStore();
  const [isLocking, setIsLocking] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState<number | null>(null);
  const [isLockedByMe, setIsLockedByMe] = useState(false);

  const quality = QUALITY_CONFIG[lead.quality] || QUALITY_CONFIG.medium;
  const serviceColor = SERVICE_COLORS[lead.service] || 'bg-purple-500/15 text-purple-300';

  // Countdown timer for locked leads
  useEffect(() => {
    if (lead.status !== 'locked' || !lead.lockExpiry) return;
    const interval = setInterval(() => {
      const remaining = new Date(lead.lockExpiry!).getTime() - Date.now();
      if (remaining <= 0) {
        setLockTimeLeft(null);
        clearInterval(interval);
      } else {
        setLockTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lead.status, lead.lockExpiry]);

  const handleLock = async () => {
    setIsLocking(true);
    try {
      const { data } = await api.post('/leads/lock', { leadId: lead._id });
      setIsLockedByMe(true);
      onLocked?.(lead._id, data.lockExpiry);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to lock lead');
    } finally {
      setIsLocking(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const { data } = await api.post('/leads/purchase', { leadId: lead._id });
      onPurchased?.(lead._id);
      alert(`Lead purchased! Client: ${data.lead.clientName} — ${data.lead.clientPhone}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      className={clsx(
        'card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40 relative overflow-hidden',
        lead.status === 'sold' && 'opacity-60'
      )}
    >
      {/* Quality bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: quality.bar }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', serviceColor)}>
          {lead.service}
        </span>
        <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', quality.bg, quality.color)}>
          {quality.label}
        </span>
      </div>

      {/* Budget */}
      <div className="font-head text-2xl font-extrabold mb-1">{lead.budgetDisplay}</div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
        <MapPin size={11} />
        <span>{lead.location}</span>
      </div>

      {/* Description teaser */}
      {lead.descriptionTeaser && (
        <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">
          {lead.descriptionTeaser}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="badge-purple text-xs">{tag}</span>
        ))}
      </div>

      {/* Intent Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">Intent Score</span>
          <span className="font-semibold text-purple-300">{lead.intentScore}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${lead.intentScore * 100}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.07]">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={10} />
            <span>{formatTimeAgo(lead.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400 mt-0.5">
            <Star size={11} fill="currentColor" />
            <span>{lead.creditCost} credits</span>
          </div>
        </div>

        {lead.status === 'sold' ? (
          <span className="badge-purple">Sold</span>
        ) : lead.status === 'locked' && !isLockedByMe ? (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
            <Lock size={11} />
            {lockTimeLeft ? formatTimeLeft(lockTimeLeft) : 'Locked'}
          </div>
        ) : isLockedByMe ? (
          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Zap size={12} />
            {isPurchasing ? 'Buying...' : 'Buy Now'}
          </button>
        ) : (
          <button
            onClick={handleLock}
            disabled={isLocking}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Lock size={12} />
            {isLocking ? 'Locking...' : 'Buy Lead →'}
          </button>
        )}
      </div>
    </div>
  );
}
