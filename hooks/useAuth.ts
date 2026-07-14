import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User } from '@/types';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success('Login successful!');
            router.push('/chat');
            return { success: true };
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            return { success: false };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await api.post('/auth/register', { name, email, password });
            toast.success('Registration successful! Please login.');
            router.push('/login');
            return { success: true };
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return { success: false };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
        toast.success('Logged out');
    };

    return { user, loading, login, register, logout };
};