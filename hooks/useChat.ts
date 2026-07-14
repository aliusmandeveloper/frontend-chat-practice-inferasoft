import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Conversation, Message, User } from '@/types';

export const useChat = (userId: string) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch all conversations
    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/conversations');
            setConversations(res.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get or create conversation
    const getOrCreateConversation = async (otherUserId: string) => {
        try {
            const res = await api.post('/conversations/create', { otherUserId });
            return res.data.conversation;
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    };

    // Fetch messages for a conversation
    const fetchMessages = async (conversationId: string, page: number = 1) => {
        try {
            const res = await api.get(`/conversations/messages/${conversationId}?page=${page}&limit=20`);
            setMessages(res.data.messages);
            return res.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return null;
        }
    };

    // Send message (API + Socket will handle)
    const sendMessage = async (conversationId: string, text: string) => {
        try {
            const res = await api.post('/conversations/messages', { conversationId, text });
            return res.data.message;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    };

    return {
        conversations,
        currentConversation,
        messages,
        loading,
        users,
        fetchUsers,
        fetchConversations,
        getOrCreateConversation,
        fetchMessages,
        setCurrentConversation,
        setMessages,
        sendMessage
    };
};