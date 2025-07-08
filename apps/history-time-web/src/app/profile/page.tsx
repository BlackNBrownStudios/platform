'use client';

import React, { useEffect } from 'react';

// Force dynamic rendering for this page since it uses authentication
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../components/Profile/ProfileForm';
import UserStats from '../../components/Profile/UserStats';
import { useSharedAuth } from '../../hooks/useSharedAuth';

/**
 * User Profile Page
 * This component manages user profile display and editing
 * Uses shared hooks and components for consistency with mobile
 */
export default function ProfilePage() {
  const router = useRouter();
  const authState = useSharedAuth();
  const { user, loading } = authState;
  const isAuthenticated = !!user;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading profile...</h2>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show content only for authenticated users
  if (!isAuthenticated || !user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile form that uses shared hooks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
          <ProfileForm />
        </div>

        {/* User statistics that display game history */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Game Statistics</h2>
          <UserStats userId={user.id} />
        </div>
      </div>
    </div>
  );
}
