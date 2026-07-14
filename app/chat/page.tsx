'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Conversation } from '@/types';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { NotificationBell } from '@/components/chat/NotificationBell';
export default function ChatPage() {
    const { user, loading } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [usersWithStatus, setUsersWithStatus] = useState<any[]>([]);

    const {
        conversations,
        currentConversation,
        messages,
        users,
        fetchUsers,
        fetchConversations,
        getOrCreateConversation,
        fetchMessages,
        setCurrentConversation,
        setMessages
    } = useChat(user?._id || '');

    const {
        isConnected,
        onlineUsers,
        sendMessage,
        sendTyping,
        onReceiveMessage
    } = useSocket(user?._id || '');

    // ✅ Force update users when onlineUsers changes
    useEffect(() => {
        if (users.length > 0) {
            const updated = users.map(u => ({
                ...u,
                isOnline: onlineUsers.includes(u._id)
            }));
            setUsersWithStatus(updated);
            console.log('✅ Users updated:', updated.length, 'users');
        }
    }, [users, onlineUsers]);

    // ✅ Load users every 5 seconds (temporary fix)
    useEffect(() => {
        if (user) {
            fetchUsers();
            const interval = setInterval(() => {
                fetchUsers();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // ✅ Refresh on socket connect
    useEffect(() => {
        if (isConnected && user) {
            fetchUsers();
        }
    }, [isConnected]);

    // Handle receiving new message
    useEffect(() => {
        onReceiveMessage((message) => {
            console.log('📩 New message received:', message);
            if (currentConversation && message.conversation === currentConversation._id) {
                setMessages((prev) => [...prev, message]);
            }
            fetchConversations();
            toast.success('New message received!');
        });
    }, [currentConversation]);

    // Handle conversation select
    const handleSelectConversation = async (conversation: Conversation) => {
        if (conversation._id === 'new') {
            const otherUser = conversation.participants.find(
                p => p._id !== user?._id
            );
            if (otherUser) {
                const newConv = await getOrCreateConversation(otherUser._id);
                if (newConv) {
                    setSelectedConversation(newConv);
                    setCurrentConversation(newConv);
                    await fetchMessages(newConv._id);
                    await fetchConversations();
                }
            }
            return;
        }

        setSelectedConversation(conversation);
        setCurrentConversation(conversation);
        await fetchMessages(conversation._id);
    };

    // Handle send message
    const handleSendMessage = (text: string) => {
        if (!currentConversation) return;

        const messageData = {
            conversationId: currentConversation._id,
            senderId: user!._id,
            text
        };

        sendMessage(messageData);

        const tempMessage = {
            _id: Date.now().toString(),
            text,
            sender: user!._id,
            conversation: currentConversation._id,
            isRead: false,
            readBy: [],
            createdAt: new Date().toISOString()
        };
        // @ts-ignore
        setMessages((prev) => [...prev, tempMessage]);
    };

    // Handle typing
    const handleTyping = (isTyping: boolean) => {
        if (!currentConversation) return;

        const otherUser = currentConversation.participants.find(
            p => p._id !== user?._id
        );

        if (otherUser) {
            sendTyping({
                conversationId: currentConversation._id,
                senderId: user!._id,
                receiverId: otherUser._id,
                isTyping
            });
        }
    };

    if (loading) return <Loader />;
    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-1/3 bg-white border-r">
              {/* // ✅ NAYA CODE - YE PASTE KARO */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Chats</h1>
                        <p className="text-sm text-gray-500">
                            {user.name}
                            <span className={`ml-2 text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                                {isConnected ? '🟢 Online' : '🔴 Offline'}
                            </span>
                        </p>
                        {/* <p className="text-xs text-gray-400 mt-1">
                            Online users: {onlineUsers?.length || 0}
                        </p> */}
                    </div>
                    <NotificationBell />
                </div>
                <ChatList
                    conversations={conversations}
                    onSelect={handleSelectConversation}
                    currentUser={user}
                    users={usersWithStatus}
                />
            </div>

            <div className="flex-1">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        currentUser={user}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}