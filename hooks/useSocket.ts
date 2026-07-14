import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { Message } from '@/types';

export const useSocket = (userId?: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        console.log('🔌 Socket init for:', userId);
        
        socketRef.current = getSocket(userId);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Connected:', socket.id);
            setIsConnected(true);
            socket.emit('user-online', userId);
            socket.emit('get-online-users');
        });

        // ✅ Listen for online users update
        socket.on('online-users-update', (users: string[]) => {
            console.log('📋 Online users update:', users);
            setOnlineUsers(users || []);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected');
            setIsConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('online-users-update');
            socket.off('disconnect');
        };
    }, [userId]);

    const sendMessage = (data: { conversationId: string; senderId: string; text: string }) => {
        socketRef.current?.emit('send-message', data);
    };

    const sendTyping = (data: { conversationId: string; senderId: string; receiverId: string; isTyping: boolean }) => {
        socketRef.current?.emit('typing', data);
    };

    const markSeen = (data: { messageId: string; userId: string }) => {
        socketRef.current?.emit('message-seen', data);
    };

    const onReceiveMessage = (callback: (message: Message) => void) => {
        socketRef.current?.on('receive-message', callback);
    };

    const onTypingStatus = (callback: (data: any) => void) => {
        socketRef.current?.on('typing-status', callback);
    };

    const onMessageRead = (callback: (data: any) => void) => {
        socketRef.current?.on('message-read', callback);
    };

    return {
        isConnected,
        onlineUsers,
        sendMessage,
        sendTyping,
        markSeen,
        onReceiveMessage,
        onTypingStatus,
        onMessageRead,
        socket: socketRef.current
    };
};