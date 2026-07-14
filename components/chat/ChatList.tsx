'use client';

import { User, Conversation } from '@/types';

interface ChatListProps {
    conversations: Conversation[];
    onSelect: (conversation: Conversation) => void;
    currentUser: User;
    users?: User[];
}

export const ChatList = ({ 
    conversations, 
    onSelect, 
    currentUser,
    users = []
}: ChatListProps) => {
    
    // Get other participant in 1-to-1 chat
    const getOtherUser = (conversation: Conversation) => {
        return conversation.participants.find(
            p => p._id !== currentUser._id
        );
    };

    const getLastMessage = (conversation: Conversation) => {
        if (conversation.lastMessage) {
            return conversation.lastMessage.text;
        }
        return 'No messages yet';
    };

    const getTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Show users list if no conversations
    if (conversations.length === 0 && users.length > 0) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-600">All Users</h3>
                </div>
                {users.map((user) => {
                    if (user._id === currentUser._id) return null;
                    return (
                        <div
                            key={user._id}
                            onClick={() => {
                                onSelect({
                                    _id: 'new',
                                    participants: [currentUser, user],
                                    isGroup: false,
                                    updatedAt: new Date().toISOString(),
                                    unreadCount: 0
                                } as Conversation);
                            }}
                            className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    {/* ✅ Safe access */}
                                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                {user?.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{user?.name || 'Unknown'}</h3>
                                    <span className="text-xs text-gray-500">
                                        {user?.isOnline ? '🟢 Online' : '⚫ Offline'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {user?.email || ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                if (!otherUser) return null;

                return (
                    <div
                        key={conversation._id}
                        onClick={() => onSelect(conversation)}
                        className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                {/* ✅ Safe access */}
                                {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            {otherUser?.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>

                        <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">{otherUser?.name || 'Unknown'}</h3>
                                <span className="text-xs text-gray-500">
                                    {getTime(conversation.updatedAt)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                                {getLastMessage(conversation)}
                            </p>
                        </div>

                        {conversation.unreadCount > 0 && (
                            <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                            </div>
                        )}
                    </div>
                );
            })}

            {conversations.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No conversations yet.<br />
                    Click on a user to start chatting!
                </div>
            )}
        </div>
    );
};