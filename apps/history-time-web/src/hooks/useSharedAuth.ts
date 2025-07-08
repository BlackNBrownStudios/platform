'use client';

/**
 * Simplified auth hook during monorepo migration
 */

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
}

const useSharedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      console.log('Login temporarily disabled during migration', credentials);
      setError(null);
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setError(null);
    } catch (err) {
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      console.log('Register temporarily disabled during migration', userData);
      setError(null);
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };
};

export { useSharedAuth };
export default useSharedAuth;
