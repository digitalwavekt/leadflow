export default function AdminSettingsPage() {
    return (
        <div>
            <h1 className="font-head text-2xl font-extrabold mb-6">Settings</h1>

            <div className="card p-6 space-y-5">
                <div>
                    <h2 className="font-bold text-lg">Platform Settings</h2>
                    <p className="text-gray-500 text-sm">Manage LeadFlow admin configuration.</p>
                </div>

                <div>
                    <label className="block text-sm mb-2">Platform Commission (%)</label>
                    <input className="input max-w-md" placeholder="10" />
                </div>

                <div>
                    <label className="block text-sm mb-2">Payment Mode</label>
                    <select className="input max-w-md">
                        <option>Mock Payment</option>
                        <option>Razorpay Live</option>
                    </select>
                </div>

                <button className="btn-primary">Save Settings</button>
            </div>
        </div>
    );
}