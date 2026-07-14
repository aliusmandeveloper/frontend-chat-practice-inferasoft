'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Conversation, Message } from '@/types';
import Loader from '@/components/common/Loader';
import Image from 'next/image';
import Link from 'next/link';
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
            fetchConversations();
            setTimeout(() => {
                fetchConversations();
            }, 1000);
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
    const fetchMessagesWithRetry = async (conversationId: string) => {
        try {
            const data = await fetchMessages(conversationId);
            console.log('Fetched messages:', data);

            // ✅ Check if messages have sender profilePic
            if (data?.messages) {
                data.messages.forEach((msg: Message) => {
                    if (typeof msg.sender !== 'string') {
                        console.log('Sender profilePic:', msg.sender?.profilePic);
                    }
                });
            }
            return data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return null;
        }
    };
    // Handle conversation select
    const handleSelectConversation = async (conversation: Conversation) => {
        console.log('Selected Conversation:', conversation);
        console.log('Participants:', conversation.participants);
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
            <div className="w-[25vw] bg-white border-r">
                {/* // ✅ NAYA CODE - YE PASTE KARO */}
                <div className="p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* ✅ Profile Image */}
                        <Link href="/profile">
                            <div className="relative cursor-pointer">
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                                {/* ✅ Online status dot */}
                                {isConnected && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                        </Link>

                        <div>
                            <h1 className="text-xl font-bold text-blue-500">Chats</h1>
                            <p className="text-sm text-gray-500">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center">

                        <NotificationBell />
                    </div>
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