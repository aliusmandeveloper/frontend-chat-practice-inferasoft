'use client';

import { useState } from 'react';

interface MessageInputProps {
    onSend: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;  // ✅ Optional karo
    disabled?: boolean;
}

export const MessageInput = ({ onSend, onTyping, disabled }: MessageInputProps) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || disabled) return;
        
        onSend(text);
        setText('');
        
        // ✅ Check if onTyping exists before calling
        if (onTyping) {
            onTyping(false);
        }
        setIsTyping(false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        
        if (!isTyping) {
            setIsTyping(true);
            if (onTyping) {
                onTyping(true);
            }
        }
    };

    const handleBlur = () => {
        if (isTyping) {
            setIsTyping(false);
            if (onTyping) {
                onTyping(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    onBlur={handleBlur}
                    placeholder="Type a message..."
                    disabled={disabled}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || disabled}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </form>
    );
};