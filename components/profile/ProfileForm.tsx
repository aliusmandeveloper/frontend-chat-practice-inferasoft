'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiUser, FiCamera } from 'react-icons/fi';  // ✅ React Icons

export const ProfileForm = () => {
    const { user, fetchUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Image upload handler
  // ✅ Upload handler
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
    }

    setUploading(true);
    try {
        const formData = new FormData();
        formData.append('image', file);  // ✅ field name 'image'

        const res = await api.post('/users/upload', formData, {  // ✅ '/users/upload'
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('✅ Upload response:', res.data);
        setProfilePic(res.data.imageUrl);
        toast.success('Image uploaded successfully!');
    } catch (error: any) {
        console.error('❌ Upload error:', error);
        toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
        setUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
};

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/users/profile', { 
                name: name.trim(),
                profilePic: profilePic.trim() || undefined
            });
            
            toast.success('Profile updated successfully!');
            await fetchUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <FiUser /> Edit Profile
            </h2>
            
            <form onSubmit={handleSubmit}>
                {/* ✅ Avatar with upload button */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600">
                                    {name?.charAt(0)?.toUpperCase() || <FiUser size={30} />}
                                </span>
                            )}
                        </div>
                        
                        {/* ✅ Upload button on avatar */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {uploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <FiCamera size={16} />
                            )}
                        </button>
                        
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your name"
                        disabled={loading || uploading}
                    />
                </div>

                {/* OR Image URL Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Or Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={profilePic}
                            onChange={(e) => setProfilePic(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/photo.jpg"
                            disabled={loading || uploading}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Upload image or paste URL
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiUpload />
                        )}
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};