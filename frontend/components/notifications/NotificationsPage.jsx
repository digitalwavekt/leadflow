"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notificationAPI } from "@/lib/api";

type Notification = {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState < Notification[] > ([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await notificationAPI.getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error("Fetch notifications error:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        await notificationAPI.markAsRead(id);
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        await notificationAPI.markAllAsRead();
        fetchNotifications();
    };

    const deleteNotification = async (id: string) => {
        await notificationAPI.deleteNotification(id);
        fetchNotifications();
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) {
        return <div className="p-6">Loading notifications...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-sm text-gray-500">
                        {unreadCount} unread notifications
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="border rounded-xl p-8 text-center text-gray-500">
                    No notifications found.
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((item) => (
                        <div
                            key={item._id}
                            className={`border rounded-xl p-4 ${item.isRead ? "bg-white" : "bg-blue-50"
                                }`}
                        >
                            <div className="flex justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-3 text-sm">
                                    {!item.isRead && (
                                        <button
                                            onClick={() => markAsRead(item._id)}
                                            className="text-blue-600"
                                        >
                                            Read
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteNotification(item._id)}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {item.link && (
                                <Link
                                    href={item.link}
                                    className="inline-block mt-3 text-sm underline"
                                >
                                    Open
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}