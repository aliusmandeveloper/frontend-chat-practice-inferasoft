'use client';

import { Conversation, Message, User } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: User;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;
}

export const ChatWindow = ({
    conversation,
    currentUser,
    messages,
    onSendMessage,
    onTyping = () => {}
}: ChatWindowProps) => {
    const getOtherUser = () => {
        return conversation.participants.find(
            p => p._id !== currentUser._id
        );
    };

    const otherUser = getOtherUser();

    // ✅ Agar otherUser nahi hai to return karo
    if (!otherUser) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                User not found
            </div>
        );
    }

    // Socket for typing indicator
    const { onTypingStatus } = useSocket(currentUser._id);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    useEffect(() => {
        onTypingStatus((data: any) => {
            if (data.conversationId === conversation._id) {
                setTypingUser(data.isTyping ? data.userId : null);
            }
        });
    }, [conversation._id]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center p-4 border-b bg-white">
                <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {/* ✅ Safe access with optional chaining and fallback */}
                        {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div className="ml-3">
                    <h2 className="font-semibold">{otherUser?.name || 'Unknown'}</h2>
                    <p className="text-xs text-gray-500">
                        {otherUser?.isOnline ? '🟢 Online' : '⚫ Offline'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <MessageList messages={messages} currentUser={currentUser} />

            {/* Typing indicator */}
            {typingUser && (
                <div className="px-4 py-1 text-sm text-gray-500">
                    {typingUser === otherUser?._id && 'typing...'}
                </div>
            )}

            {/* Input */}
            <MessageInput 
                onSend={onSendMessage} 
                onTyping={onTyping}
            />
        </div>
    );
};