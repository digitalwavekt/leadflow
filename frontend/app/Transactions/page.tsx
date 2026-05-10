'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTransactions = async () => {
        try {
            const res = await adminAPI.getTransactions();
            setTransactions(res.data.transactions || []);
        } catch (error) {
            console.error('Load transactions error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    return (
        <div className="p-7">
            <h1 className="font-head text-2xl font-extrabold mb-6">
                Transactions
            </h1>

            {loading ? (
                <p className="text-gray-400">Loading transactions...</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Type</th>
                                <th className="text-left p-3">Credits</th>
                                <th className="text-left p-3">Amount</th>
                                <th className="text-left p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn._id} className="border-t border-white/10">
                                    <td className="p-3">
                                        {txn.userId?.name || txn.userId?.email || 'Unknown'}
                                    </td>
                                    <td className="p-3">{txn.type}</td>
                                    <td className="p-3">{txn.creditsDelta}</td>
                                    <td className="p-3">₹{txn.amountINR || 0}</td>
                                    <td className="p-3">{txn.status || 'success'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}