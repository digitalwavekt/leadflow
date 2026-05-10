'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Load users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="p-7">
            <h1 className="font-head text-2xl font-extrabold mb-6">Users</h1>

            {loading ? (
                <p className="text-gray-400">Loading users...</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Role</th>
                                <th className="text-left p-3">Credits</th>
                                <th className="text-left p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-t border-white/10">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3 text-gray-400">{user.email}</td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3">{user.credits ?? 0}</td>
                                    <td className="p-3">
                                        {user.isActive ? 'Active' : 'Inactive'}
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