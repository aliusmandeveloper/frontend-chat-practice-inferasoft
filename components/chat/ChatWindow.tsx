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
    onTyping = () => { }
}: ChatWindowProps) => {
    
    const getOtherUser = () => {
        const other = conversation.participants.find(
            p => p._id !== currentUser._id
        );

        // ✅ Debug log
        // console.log('Current User:', currentUser);
        // console.log('All Participants:', conversation.participants);
        // console.log('Other User:', other);

        return other;
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
            {/* ✅ Header with Profile Image */}
            <div className="flex items-center p-4 border-b bg-white">
                <div className="relative">
                    {/* ✅ Profile Image with fallback */}
                    {otherUser?.profilePic ? (
                        <img
                            src={otherUser.profilePic}
                            alt={otherUser.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                            {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                    {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div className="ml-3">
                    <h2 className="font-semibold text-gray-800">{otherUser?.name || 'Unknownnn'}</h2>
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