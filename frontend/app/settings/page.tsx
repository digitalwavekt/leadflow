'use client';

export default function AdminSettingsPage() {
    return (
        <div className="p-7">
            <h1 className="font-head text-2xl font-extrabold mb-6">Settings</h1>

            <div className="card p-6 space-y-4">
                <div>
                    <h2 className="font-bold text-lg">Platform Settings</h2>
                    <p className="text-gray-500 text-sm">
                        Manage LeadFlow platform configuration.
                    </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <p className="text-gray-400 text-sm">
                        Settings module placeholder. Later we can add credit pricing,
                        lead lock duration, Razorpay keys status, admin profile, and system controls.
                    </p>
                </div>
            </div>
        </div>
    );
}