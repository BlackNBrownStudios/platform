'use client';

/**
 * Simplified profile hook during monorepo migration
 */

import { useState } from 'react';

export function useSharedProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (profileData: any) => {
    setUpdating(true);
    try {
      console.log('Profile update temporarily disabled during migration', profileData);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const uploadPicture = async (file: File) => {
    try {
      console.log('Picture upload temporarily disabled during migration', file.name);
    } catch (err) {
      setError('Failed to upload picture');
    }
  };

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadPicture,
  };
}

export default useSharedProfile;
