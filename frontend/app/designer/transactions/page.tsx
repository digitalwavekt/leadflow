'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import { StatusPill } from '@/components/ui/StatCard';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';

const PACKS = [
  { key: 'starter', credits: 50, bonus: 0, price: 999, label: 'Starter', highlight: false },
  { key: 'pro', credits: 150, bonus: 10, price: 2499, label: 'Pro', highlight: true },
  { key: 'enterprise', credits: 500, bonus: 50, price: 6999, label: 'Enterprise', highlight: false },
];

const MOCK_TRANSACTIONS = [
  { _id: 't1', type: 'credit_purchase', description: 'Pro Pack — 160 credits', creditsDelta: 160, amountINR: 2499, status: 'success', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 't2', type: 'lead_purchase', description: 'Purchased lead — Interior Design', creditsDelta: -5, status: 'success', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 't3', type: 'refund', description: 'Refund — Invalid lead #LF-2025-0771', creditsDelta: 3, status: 'success', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 't4', type: 'lead_purchase', description: 'Purchased lead — Logo Design', creditsDelta: -3, status: 'success', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 't5', type: 'bonus', description: 'Welcome bonus — 3 free credits', creditsDelta: 3, status: 'success', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
];

export default function TransactionsPage() {
  const { user, setCredits } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedPack, setSelectedPack] = useState('pro');
  const [isBuying, setIsBuying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/users/transactions');
      setTransactions(data.transactions);
    } catch {
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      // 1. Create order
      const { data: orderData } = await api.post('/payments/create-order', { pack: selectedPack });
      // 2. In production, open Razorpay checkout here
      // For demo, directly verify with mock
      const { data: verifyData } = await api.post('/payments/verify', {
        orderId: orderData.order.id,
        paymentId: `pay_mock_${Date.now()}`,
        pack: selectedPack,
        mockSuccess: true,
      });
      setCredits(verifyData.totalCredits);
      setSuccessMsg(`${verifyData.creditsAdded} credits added to your account!`);
      fetchTransactions();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      // Mock success for demo
      const pack = PACKS.find((p) => p.key === selectedPack);
      if (pack) {
        const newCredits = (user?.credits || 0) + pack.credits + pack.bonus;
        setCredits(newCredits);
        setSuccessMsg(`${pack.credits + pack.bonus} credits added! (Demo mode)`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } finally {
      setIsBuying(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const TYPE_CONFIG: Record<string, { label: string; class: string; icon: string }> = {
    credit_purchase: { label: 'Credit Purchase', class: 'badge-green', icon: '💳' },
    lead_purchase: { label: 'Lead Purchase', class: 'badge-purple', icon: '🎯' },
    refund: { label: 'Refund', class: 'badge-gold', icon: '↩️' },
    bonus: { label: 'Bonus', class: 'badge-green', icon: '🎁' },
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="transactions" />
      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">Credits & Transactions</h1>
        <p className="text-gray-400 text-sm mb-6">Buy credits and view your transaction history.</p>

        {successMsg && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400 flex items-center gap-2">
            <CheckCircle size={15} /> {successMsg}
          </div>
        )}

        {/* Buy Credits Section */}
        <div className="card p-6 mb-6">
          <div className="font-head text-base font-bold mb-1">Buy Credits</div>
          <p className="text-xs text-gray-500 mb-5">Credits never expire. Use them to buy leads anytime.</p>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {PACKS.map((pack) => (
              <button
                key={pack.key}
                onClick={() => setSelectedPack(pack.key)}
                className={`relative rounded-2xl border-2 p-5 text-center transition-all ${
                  selectedPack === pack.key
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                {pack.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Popular
                  </div>
                )}
                <div className="font-head text-3xl font-extrabold text-purple-400">{pack.credits}</div>
                <div className="text-xs text-gray-500 mb-1">credits</div>
                <div className="text-sm font-semibold mb-0.5">₹{pack.price.toLocaleString('en-IN')}</div>
                {pack.bonus > 0 && (
                  <div className="text-xs text-green-400">+{pack.bonus} free</div>
                )}
                <div className="text-[10px] text-gray-500 mt-1 capitalize">{pack.label}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-bg-3 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Selected:</span>
                <span className="font-semibold">
                  {(() => {
                    const p = PACKS.find((x) => x.key === selectedPack);
                    return p ? `${p.credits + p.bonus} credits — ₹${p.price.toLocaleString('en-IN')}` : '';
                  })()}
                </span>
              </div>
            </div>
            <button
              onClick={handleBuy}
              disabled={isBuying}
              className="btn-primary px-6 py-3 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {isBuying ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} fill="currentColor" />}
              {isBuying ? 'Processing...' : 'Pay with Razorpay →'}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span>🔒 Secure payment via Razorpay</span>
            <span>🔄 Credits never expire</span>
            <span>↩️ Refunds for invalid leads</span>
          </div>
        </div>

        {/* Current Balance */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Current Balance</div>
              <div className="font-head text-4xl font-extrabold text-yellow-400">{user?.credits ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">≈ {Math.floor((user?.credits ?? 0) / 5)} leads available</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center">
              <Star size={28} className="text-yellow-400" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <div className="font-head text-base font-bold">Transaction History</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-3 border-b border-white/[0.07]">
                  {['Date', 'Type', 'Description', 'Credits', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-white/[0.05]">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : transactions.map((t) => {
                  const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.bonus;
                  return (
                    <tr key={t._id} className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{formatDate(t.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.class}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 max-w-xs truncate">{t.description}</td>
                      <td className={`px-4 py-3.5 font-semibold ${t.creditsDelta > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {t.creditsDelta > 0 ? '+' : ''}{t.creditsDelta}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{t.amountINR ? `₹${t.amountINR.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="px-4 py-3.5"><StatusPill status={t.status === 'success' ? 'open' : 'pending'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
