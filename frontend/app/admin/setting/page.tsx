'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
    const [commission, setCommission] = useState('10');
    const [leadBasePrice, setLeadBasePrice] = useState('199');
    const [highQualityPrice, setHighQualityPrice] = useState('499');
    const [paymentMode, setPaymentMode] = useState('mock');
    const [message, setMessage] = useState('');

    const handleSave = () => {
        setMessage('Settings saved locally. Backend API integration pending.');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div>
            <h1 className="font-head text-2xl font-extrabold mb-1">Settings</h1>
            <p className="text-gray-400 text-sm mb-6">
                Manage LeadFlow pricing, payment mode, and platform rules.
            </p>

            {message && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400">
                    {message}
                </div>
            )}

            <div className="card p-6 max-w-3xl space-y-6">
                <div>
                    <h2 className="font-head text-lg font-bold mb-1">
                        Pricing Settings
                    </h2>
                    <p className="text-sm text-gray-500">
                        Configure platform commission and lead pricing.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Platform Commission %
                        </label>
                        <input
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            type="number"
                            className="input w-full"
                            placeholder="10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Base Lead Price ₹
                        </label>
                        <input
                            value={leadBasePrice}
                            onChange={(e) => setLeadBasePrice(e.target.value)}
                            type="number"
                            className="input w-full"
                            placeholder="199"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            High Quality Lead Price ₹
                        </label>
                        <input
                            value={highQualityPrice}
                            onChange={(e) => setHighQualityPrice(e.target.value)}
                            type="number"
                            className="input w-full"
                            placeholder="499"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Payment Mode
                        </label>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="input w-full"
                        >
                            <option value="mock">Mock Payment</option>
                            <option value="razorpay">Razorpay Live</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                    <button onClick={handleSave} className="btn-primary">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}