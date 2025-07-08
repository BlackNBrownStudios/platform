'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: (name?: string) => void;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loginAsGuest: () => {},
});

// Guest user ID storage key
const GUEST_USER_KEY = 'history_time_guest_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if we have a guest user
  useEffect(() => {
    const checkGuestUser = () => {
      try {
        // For a real auth system, we would verify JWT or session here
        // For now, we'll just check if we have a guest user in localStorage
        if (typeof window !== 'undefined') {
          const guestUserData = localStorage.getItem(GUEST_USER_KEY);

          if (guestUserData) {
            const guestUser = JSON.parse(guestUserData);
            setUser(guestUser);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkGuestUser();
  }, []);

  // Login function (placeholder for real auth)
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // This would be a real API call in a production app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        isGuest: false,
      };

      setUser(mockUser);

      // In a real app, we'd store the JWT token here
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function (placeholder for real auth)
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // This would be a real API call in a production app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      const mockUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        isGuest: false,
      };

      setUser(mockUser);

      // In a real app, we'd store the JWT token here
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // This would be a real API call in a production app
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUser(null);

      // Clear any guest user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_USER_KEY);
      }

      // In a real app, we'd clear the JWT token here
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Login as guest
  const loginAsGuest = (name?: string) => {
    const guestName = name || `Guest_${Math.floor(Math.random() * 10000)}`;
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: guestName,
      isGuest: true,
    };

    setUser(guestUser);

    // Store guest user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default auth state if context is not available (during SSR)
    return {
      user: null,
      loading: false,
      error: null,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      loginAsGuest: () => {},
    };
  }
  return context;
};
