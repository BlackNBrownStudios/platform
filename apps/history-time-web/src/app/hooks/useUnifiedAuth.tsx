'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
// TODO: Replace with platform auth when available
// import { useAuth as useAuthCore, AuthService, WebStorageAdapter } from '@history-time/auth';
import { useConfig } from './useConfig';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getApiBaseUrl } = useConfig();
  const apiUrl = getApiBaseUrl();

  // Mock auth state for now
  const authState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };

  const authActions = {
    login: async (email: string, password: string) => {
      console.log('Mock login:', email);
    },
    register: async (name: string, email: string, password: string) => {
      console.log('Mock register:', name, email);
    },
    logout: async () => {
      console.log('Mock logout');
    },
  };

  const loginAsGuest = useCallback(
    async (name?: string) => {
      const guestName = name || `Guest_${Math.floor(Math.random() * 10000)}`;
      await authActions.register(
        guestName,
        `${guestName.toLowerCase()}@guest.local`,
        Math.random().toString(36).substring(7)
      );
    },
    [authActions]
  );

  const value = useMemo(
    () => ({
      user: authState.user,
      loading: authState.loading,
      error: authState.error,
      isAuthenticated: authState.isAuthenticated,
      login: authActions.login,
      register: authActions.register,
      logout: authActions.logout,
      loginAsGuest,
    }),
    [authState, authActions, loginAsGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUnifiedAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
};
