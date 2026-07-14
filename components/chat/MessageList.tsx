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

    const getTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => {
                const myMessage = isMyMessage(message);
                return (
                    <div
                        key={message._id}
                        className={`flex ${myMessage ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                        <div
                            className={`max-w-[70%] ${myMessage
                                    ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                    : 'bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                } p-3`}
                        >
                            {!myMessage && (
                                <p className="text-xs font-semibold mb-1">
                                    {getSenderName(message)}
                                </p>
                            )}
                            <p className="wrap-break-word">{message.text}</p>
                            <div className={`flex justify-end mt-1 ${myMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                <span className="text-xs">{getTime(message.createdAt)}</span>
                                {myMessage && (
                                    <span className="ml-1 text-xs">
                                        {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};