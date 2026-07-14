'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export const NotificationBell = () => {
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = 
        useNotifications(user?._id || '');
    
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full"
            >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification._id);
                                    }
                                    // Navigate to chat if conversationId exists
                                    if (notification.conversationId) {
                                        window.location.href = `/chat?conversation=${notification.conversationId}`;
                                    }
                                }}
                                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                    !notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {notification.sender.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};