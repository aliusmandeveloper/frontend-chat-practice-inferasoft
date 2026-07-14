export interface User {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
    isOnline: boolean;
    lastSeen?: string;
}

export interface Message {
    _id: string;
    sender: User | string;
    conversation: string;
    text: string;
    image?: string;
    isRead: boolean;
    readBy: string[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: User[];
    isGroup: boolean;
    groupName?: string;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    user: User;
    token: string;
}