'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiMic } from 'react-icons/fi';

interface MessageInputProps {
    onSend: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
}

export const MessageInput = ({ onSend, onTyping, disabled }: MessageInputProps) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    let typingTimeout: NodeJS.Timeout;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || disabled) return;
        
        onSend(text);
        setText('');
        
        // ✅ Stop typing indicator
        if (onTyping) {
            onTyping(false);
        }
        setIsTyping(false);
        clearTimeout(typingTimeout);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        
        // ✅ Send typing event
        if (!isTyping) {
            setIsTyping(true);
            if (onTyping) {
                onTyping(true);
                console.log('📝 Started typing');
            }
        }

        // ✅ Clear existing timeout
        clearTimeout(typingTimeout);
        
        // ✅ Stop typing after 1.5 seconds of no input
        typingTimeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                if (onTyping) {
                    onTyping(false);
                    console.log('📝 Stopped typing');
                }
            }
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // ✅ Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeout);
        };
    }, []);

    return (
        <div className="p-3 bg-[#f0f0f0] border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <FiSmile size={24} />
                </button>

                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <FiPaperclip size={22} />
                </button>

                <div className="flex-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false);
                            if (isTyping) {
                                setIsTyping(false);
                                if (onTyping) {
                                    onTyping(false);
                                }
                            }
                        }}
                        placeholder={isFocused ? 'Type a message...' : 'Message'}
                        disabled={disabled}
                        className={`
                            w-full px-4 py-2.5 bg-white rounded-full 
                            focus:outline-none focus:ring-2 
                            text-gray-800 placeholder-gray-400
                            transition-all duration-200
                            ${isFocused 
                                ? 'ring-2 ring-green-500 border-transparent shadow-md' 
                                : 'border border-gray-300 shadow-sm'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!text.trim() || disabled}
                    className={`
                        p-2.5 rounded-full transition-all duration-200
                        ${text.trim() && !disabled
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {text.trim() ? (
                        <FiSend size={22} />
                    ) : (
                        <FiMic size={22} />
                    )}
                </button>
            </form>
        </div>
    );
};

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { FiSend, FiPaperclip, FiSmile, FiMic } from 'react-icons/fi';

// interface MessageInputProps {
//     onSend: (text: string) => void;
//     onTyping?: (isTyping: boolean) => void;
//     disabled?: boolean;
// }

// export const MessageInput = ({ onSend, onTyping, disabled }: MessageInputProps) => {
//     const [text, setText] = useState('');
//     const [isTyping, setIsTyping] = useState(false);
//     const [isFocused, setIsFocused] = useState(false);
//     const inputRef = useRef<HTMLInputElement>(null);

//     // ✅ Typing timeout
//     let typingTimeout: NodeJS.Timeout;

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!text.trim() || disabled) return;
        
//         onSend(text);
//         setText('');
        
//         if (onTyping) {
//             onTyping(false);
//         }
//         setIsTyping(false);
//     };

//     const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setText(e.target.value);
        
//         // ✅ Typing indicator with debounce
//         if (!isTyping) {
//             setIsTyping(true);
//             if (onTyping) {
//                 onTyping(true);
//             }
//         }

//         clearTimeout(typingTimeout);
//         typingTimeout = setTimeout(() => {
//             if (isTyping) {
//                 setIsTyping(false);
//                 if (onTyping) {
//                     onTyping(false);
//                 }
//             }
//         }, 1000);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSubmit(e);
//         }
//     };

//     return (
//         <div className="p-3 bg-[#f0f0f0] border-t border-gray-200">
//             <form onSubmit={handleSubmit} className="flex items-center gap-2">
//                 {/* ✅ Emoji Button */}
//                 <button
//                     type="button"
//                     className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
//                 >
//                     <FiSmile size={24} />
//                 </button>

//                 {/* ✅ Attachment Button */}
//                 <button
//                     type="button"
//                     className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
//                 >
//                     <FiPaperclip size={22} />
//                 </button>

//                 {/* ✅ Input Field */}
//                 <div className="flex-1 relative">
//                     <input
//                         ref={inputRef}
//                         type="text"
//                         value={text}
//                         onChange={handleTyping}
//                         onKeyDown={handleKeyDown}
//                         onFocus={() => setIsFocused(true)}
//                         onBlur={() => setIsFocused(false)}
//                         placeholder={isFocused ? 'Type a message...' : 'Message'}
//                         disabled={disabled}
//                         className={`
//                             w-full px-4 py-2.5 bg-white rounded-full 
//                             focus:outline-none focus:ring-2 
//                             text-gray-800 placeholder-gray-400
//                             transition-all duration-200
//                             ${isFocused 
//                                 ? 'ring-2 ring-green-500 border-transparent shadow-md' 
//                                 : 'border border-gray-300 shadow-sm'
//                             }
//                             ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
//                         `}
//                     />
//                 </div>

//                 {/* ✅ Send Button - WhatsApp Style */}
//                 <button
//                     type="submit"
//                     disabled={!text.trim() || disabled}
//                     className={`
//                         p-2.5 rounded-full transition-all duration-200
//                         ${text.trim() && !disabled
//                             ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
//                             : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                         }
//                     `}
//                 >
//                     {text.trim() ? (
//                         <FiSend size={22} />
//                     ) : (
//                         <FiMic size={22} />
//                     )}
//                 </button>
//             </form>

//             {/* ✅ Typing Indicator (on input) */}
//             {/* {isTyping && (
//                 <div className="flex items-center gap-1 ml-14 mt-1">
//                     <div className="flex space-x-1">
//                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                     </div>
//                     <span className="text-xs text-gray-500 ml-1">typing...</span>
//                 </div>
//             )} */}
//         </div>
//     );
// };