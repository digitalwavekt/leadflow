'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI
            .getTransactions()
            .then((res) => setTransactions(res.data.transactions || res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="font-head text-2xl font-extrabold mb-6">Transactions</h1>

            {loading ? (
                <p className="text-gray-400">Loading transactions...</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Amount</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="border-t border-white/10">
                                    <td className="p-3">{tx.user?.name || tx.userName || 'N/A'}</td>
                                    <td className="p-3">₹{tx.amount || 0}</td>
                                    <td className="p-3">{tx.status || 'N/A'}</td>
                                    <td className="p-3">{tx.type || 'N/A'}</td>
                                    <td className="p-3">
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}