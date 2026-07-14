'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import Loader from '@/components/common/Loader';

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <ProfileForm />
            </div>
        </div>
    );
}