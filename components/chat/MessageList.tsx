'use client';
import { Message, User } from '@/types';
import { useEffect, useRef } from 'react';

interface MessageListProps {
    messages: Message[];
    currentUser: User;
}

export const MessageList = ({ messages, currentUser }: MessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isMyMessage = (message: Message) => {
        return typeof message.sender === 'string'
            ? message.sender === currentUser._id
            : message.sender._id === currentUser._id;
    };

    const getSenderName = (message: Message) => {
        if (typeof message.sender === 'string') return 'Unknown';
        return message.sender.name;
    };

    const getSenderProfilePic = (message: Message) => {
        if (typeof message.sender === 'string') return null;
        return message.sender.profilePic || null;
    };

    const getTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Group messages by date
    const getMessageDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        });
    };

    // Group messages by date
    const groupedMessages: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
        const date = getMessageDate(message.createdAt);
        if (!groupedMessages[date]) {
            groupedMessages[date] = [];
        }
        groupedMessages[date].push(message);
    });

    return (
        <div className="flex-1 p-4 overflow-y-auto bg-transparent">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                    {/* ✅ Date Divider */}
                    <div className="flex justify-center my-4">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                            {date}
                        </div>
                    </div>

                    {msgs.map((message) => {
                        const myMessage = isMyMessage(message);
                        const senderPic = getSenderProfilePic(message);
                        const senderName = getSenderName(message);
                        const isSameSender = msgs.filter(m => 
                            typeof m.sender !== 'string' && 
                            m.sender._id === (typeof message.sender !== 'string' ? message.sender._id : null)
                        ).length > 1;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${myMessage ? 'justify-end' : 'justify-start'} mb-1 items-end gap-2`}
                            >
                                {/* ✅ Sender Profile Pic (only for others) */}
                                {!myMessage && (
                                    <div className="shrink-0 w-8 h-8 mb-6">
                                        {senderPic ? (
                                            <img
                                                src={senderPic}
                                                alt={senderName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {senderName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ✅ Message Bubble */}
                                <div
                                    className={`max-w-[75%] relative ${
                                        myMessage
                                            ? 'bg-[#d9fdd3] text-gray-800 rounded-2xl rounded-tr-sm'
                                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'
                                    } px-4 py-2.5`}
                                >
                                    {/* Sender Name (for others) */}
                                    {!myMessage && (
                                        <p className="text-xs font-semibold text-blue-600 mb-0.5">
                                            {senderName}
                                        </p>
                                    )}

                                    {/* Message Text */}
                                    <p className="text-sm leading-relaxed wrap-break-word">
                                        {message.text}
                                    </p>

                                    {/* Time & Status */}
                                    <div className={`flex items-center justify-end mt-1 gap-1 ${
                                        myMessage ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        <span className="text-[10px]">
                                            {getTime(message.createdAt)}
                                        </span>
                                        {myMessage && (
                                            <span className="text-[10px]">
                                                {message.isRead ? (
                                                    <span className="text-blue-500">✓✓</span>
                                                ) : (
                                                    <span className="text-gray-400">✓</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ My Profile Pic (optional) */}
                                {myMessage && (
                                    <div className="shrink-0 w-8 h-8 mb-6">
                                        {currentUser?.profilePic ? (
                                            <img
                                                src={currentUser.profilePic}
                                                alt={currentUser.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            <div ref={bottomRef} />
        </div>
    );
};