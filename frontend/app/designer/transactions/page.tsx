'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import { StatusPill } from '@/components/ui/StatCard';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';

const DEFAULT_PACKS = [
  { key: 'starter', credits: 50, bonus: 0, price: 999, label: 'Starter', highlight: false },
  { key: 'pro', credits: 150, bonus: 10, price: 2499, label: 'Pro', highlight: true },
  { key: 'enterprise', credits: 500, bonus: 50, price: 6999, label: 'Enterprise', highlight: false },
];

export default function TransactionsPage() {
  const { user, setCredits, refreshCredits } = useAuthStore();

  const [packs, setPacks] = useState<any[]>(DEFAULT_PACKS);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedPack, setSelectedPack] = useState('pro');
  const [isBuying, setIsBuying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPacks(), fetchTransactions(), refreshCredits()]);
    setIsLoading(false);
  };

  const fetchPacks = async () => {
    try {
      const { data } = await api.get('/payments/packs');

      // BUG FIX: backend returns { packs: { starter: {...}, pro: {...} } } — an object, not an array
      const packsObj = data?.packs || data?.data?.packs || null;

      if (packsObj && typeof packsObj === 'object' && !Array.isArray(packsObj)) {
        const converted = Object.entries(packsObj).map(([key, p]: [string, any]) => ({
          key,
          credits: p.credits || 0,
          bonus: p.bonusCredits || p.bonus || 0,
          price: p.priceINR || p.price || p.amountINR || 0,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          highlight: key === 'pro',
        }));
        setPacks(converted);
      }
    } catch (err) {
      console.error('Failed to fetch packs:', err);
      setPacks(DEFAULT_PACKS);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/users/transactions');

      const transactionData =
        data?.transactions ||
        data?.data?.transactions ||
        data?.data ||
        data ||
        [];

      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
    }
  };

  const handleBuy = async () => {
    setIsBuying(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data: orderData } = await api.post('/payments/create-order', {
        pack: selectedPack,
      });

      const order = orderData?.order || orderData?.data?.order || orderData;

      const { data: verifyData } = await api.post('/payments/verify', {
        orderId: order?.id || order?._id,
        paymentId: `pay_mock_${Date.now()}`,
        pack: selectedPack,
        mockSuccess: true,
      });

      const totalCredits =
        verifyData?.totalCredits ||
        verifyData?.data?.totalCredits ||
        verifyData?.credits ||
        user?.credits ||
        0;

      const creditsAdded =
        verifyData?.creditsAdded ||
        verifyData?.data?.creditsAdded ||
        0;

      setCredits(totalCredits);
      setSuccessMsg(`${creditsAdded || 'Credits'} added to your account!`);

      await Promise.all([fetchTransactions(), refreshCredits()]);

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Payment failed:', err);
      setErrorMsg(err.response?.data?.error || 'Payment failed. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsBuying(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const TYPE_CONFIG: Record<string, { label: string; class: string }> = {
    credit_purchase: { label: 'Credit Purchase', class: 'badge-green' },
    lead_purchase: { label: 'Lead Purchase', class: 'badge-purple' },
    refund: { label: 'Refund', class: 'badge-gold' },
    bonus: { label: 'Bonus', class: 'badge-green' },
  };

  const selectedPackData = packs.find((x) => x.key === selectedPack);

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="transactions" />

      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">
          Credits & Transactions
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Buy credits and view your transaction history.
        </p>

        {successMsg && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400 flex items-center gap-2">
            <CheckCircle size={15} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="card p-6 mb-6">
          <div className="font-head text-base font-bold mb-1">Buy Credits</div>
          <p className="text-xs text-gray-500 mb-5">
            Credits never expire. Use them to buy leads anytime.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {packs.map((pack) => (
              <button
                key={pack.key}
                type="button"
                onClick={() => setSelectedPack(pack.key)}
                className={`relative rounded-2xl border-2 p-5 text-center transition-all ${selectedPack === pack.key
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/25'
                  }`}
              >
                {pack.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Popular
                  </div>
                )}

                <div className="font-head text-3xl font-extrabold text-purple-400">
                  {pack.credits}
                </div>
                <div className="text-xs text-gray-500 mb-1">credits</div>
                <div className="text-sm font-semibold mb-0.5">
                  ₹{Number(pack.price || 0).toLocaleString('en-IN')}
                </div>

                {pack.bonus > 0 && (
                  <div className="text-xs text-green-400">
                    +{pack.bonus} free
                  </div>
                )}

                <div className="text-[10px] text-gray-500 mt-1 capitalize">
                  {pack.label}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-bg-3 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Selected:</span>
                <span className="font-semibold">
                  {selectedPackData
                    ? `${selectedPackData.credits + selectedPackData.bonus} credits — ₹${Number(
                      selectedPackData.price || 0
                    ).toLocaleString('en-IN')}`
                    : 'No pack selected'}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={isBuying || !selectedPackData}
              className="btn-primary px-6 py-3 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {isBuying ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Star size={15} fill="currentColor" />
              )}
              {isBuying ? 'Processing...' : 'Pay with Razorpay →'}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span>🔒 Secure payment via Razorpay</span>
            <span>🔄 Credits never expire</span>
            <span>↩️ Refunds for invalid leads</span>
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Current Balance
              </div>
              <div className="font-head text-4xl font-extrabold text-yellow-400">
                {user?.credits ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ {Math.floor((user?.credits ?? 0) / 5)} leads available
              </div>
            </div>

            <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center">
              <Star size={28} className="text-yellow-400" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <div className="font-head text-base font-bold">
              Transaction History
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-3 border-b border-white/[0.07]">
                  {['Date', 'Type', 'Description', 'Credits', 'Amount', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-white/[0.05]">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3 bg-white/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const cfg = TYPE_CONFIG[t.type] || {
                      label: t.type || 'Transaction',
                      class: 'badge-gray',
                    };

                    const creditsDelta =
                      t.creditsDelta ?? t.credits ?? t.delta ?? 0;

                    const amount =
                      t.amountINR ?? t.amount ?? t.price ?? null;

                    return (
                      <tr
                        key={t._id}
                        className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3.5 text-gray-400 text-xs">
                          {formatDate(t.createdAt)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.class}`}
                          >
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-gray-300 max-w-xs truncate">
                          {t.description || t.title || 'Transaction completed'}
                        </td>

                        <td
                          className={`px-4 py-3.5 font-semibold ${creditsDelta > 0
                              ? 'text-green-400'
                              : 'text-yellow-400'
                            }`}
                        >
                          {creditsDelta > 0 ? '+' : ''}
                          {creditsDelta}
                        </td>

                        <td className="px-4 py-3.5 text-gray-400">
                          {amount
                            ? `₹${Number(amount).toLocaleString('en-IN')}`
                            : '—'}
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusPill
                            status={t.status === 'success' ? 'open' : 'pending'}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}