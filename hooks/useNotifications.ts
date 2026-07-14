import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useSocket } from './useSocket';

interface Notification {
    _id: string;
    recipient: string;
    sender: { _id: string; name: string; email: string };
    type: string;
    message: string;
    conversationId?: string;
    isRead: boolean;
    createdAt: string;
}

export const useNotifications = (userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { socket, onReceiveMessage } = useSocket(userId);

    // ✅ Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Mark as read
    const markAsRead = async (notificationId: string) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // ✅ Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // ✅ Listen for new notifications
    useEffect(() => {
        if (socket) {
            socket.on('new-notification', (data: any) => {
                setNotifications(prev => [data.notification, ...prev]);
                setUnreadCount(data.unreadCount);
            });
        }

        return () => {
            socket?.off('new-notification');
        };
    }, [socket]);

    // ✅ Initial fetch
    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};