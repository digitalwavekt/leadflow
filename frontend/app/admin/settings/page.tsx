'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminSettingsPage() {
    const [commissionPercent, setCommissionPercent] = useState('10');
    const [baseLeadPrice, setBaseLeadPrice] = useState('199');
    const [highQualityLeadPrice, setHighQualityLeadPrice] = useState('499');
    const [paymentMode, setPaymentMode] = useState('mock');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            const res = await adminAPI.getSettings();
            const settings = res.data.settings || res.data.data || res.data;

            setCommissionPercent(String(settings.commissionPercent ?? 10));
            setBaseLeadPrice(String(settings.baseLeadPrice ?? 199));
            setHighQualityLeadPrice(String(settings.highQualityLeadPrice ?? 499));
            setPaymentMode(settings.paymentMode || 'mock');
            setMaintenanceMode(Boolean(settings.maintenanceMode));
        } catch (error) {
            console.error('Load settings error:', error);
            setMessage('Failed to load settings from API');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await adminAPI.updateSettings({
                commissionPercent: Number(commissionPercent),
                baseLeadPrice: Number(baseLeadPrice),
                highQualityLeadPrice: Number(highQualityLeadPrice),
                paymentMode,
                maintenanceMode,
            });

            setMessage('Settings saved successfully in database');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Save settings error:', error);
            setMessage('Failed to save settings in database');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-gray-400">Loading settings...</p>;
    }

    return (
        <>
            <h1 className="font-head text-2xl font-extrabold mb-1">Settings</h1>

            <p className="text-gray-400 text-sm mb-6">
                Manage pricing, commission, payment mode, and platform rules.
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
                        These values are saved in MongoDB and controlled by admin.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Platform Commission %
                        </label>
                        <input
                            type="number"
                            value={commissionPercent}
                            onChange={(e) => setCommissionPercent(e.target.value)}
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Base Lead Price ₹
                        </label>
                        <input
                            type="number"
                            value={baseLeadPrice}
                            onChange={(e) => setBaseLeadPrice(e.target.value)}
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            High Quality Lead Price ₹
                        </label>
                        <input
                            type="number"
                            value={highQualityLeadPrice}
                            onChange={(e) => setHighQualityLeadPrice(e.target.value)}
                            className="input w-full"
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

                <div className="border-t border-white/10 pt-5 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-xs text-gray-500">
                            Later this can block client/designer actions temporarily.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMaintenanceMode((prev) => !prev)}
                        className={`px-4 py-2 rounded-xl text-sm border ${maintenanceMode
                                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                : 'bg-green-500/15 text-green-400 border-green-500/30'
                            }`}
                    >
                        {maintenanceMode ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                <div className="border-t border-white/10 pt-5">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </>
    );
}