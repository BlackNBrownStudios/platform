/**
 * Adapter for the shared authentication hook
 * This ensures consistent authentication behavior between web and mobile
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../../../shared/src/hooks/useAuth';
import { User } from '../../../../shared/src/types';
import { useSharedAdapter } from '../services/sharedAdapter';

/**
 * Mobile-specific implementation of the shared authentication hook
 */
export function useSharedAuth(autoLogin = true) {
  // Get our shared adapter
  const adapter = useSharedAdapter();

  // Create the token storage implementation for mobile
  const storage = {
    getToken: async () => AsyncStorage.getItem('userToken'),
    setToken: async (token: string) => AsyncStorage.setItem('userToken', token),
    removeToken: async () => AsyncStorage.removeItem('userToken'),

    getRefreshToken: async () => AsyncStorage.getItem('refreshToken'),
    setRefreshToken: async (token: string) => AsyncStorage.setItem('refreshToken', token),
    removeRefreshToken: async () => AsyncStorage.removeItem('refreshToken'),

    getUser: async () => {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? (JSON.parse(userData) as User) : null;
    },
    setUser: async (user: User) => AsyncStorage.setItem('userData', JSON.stringify(user)),
    removeUser: async () => AsyncStorage.removeItem('userData'),

    clearTokens: async () => {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
    },
  };

  // Create the API object expected by the shared hook
  const authApi = {
    login: async (email: string, password: string) => {
      const result = await adapter.login(email, password);
      return {
        user: result.user,
        tokens: {
          access: {
            token: result.token,
            expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          },
          refresh: {
            token: result.refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), // 7 days from now
          },
        },
      };
    },

    register: async (name: string, email: string, password: string) => {
      const result = await adapter.register(name, email, password);
      return {
        user: result.user,
        tokens: {
          access: {
            token: result.token,
            expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          },
          refresh: {
            token: result.refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), // 7 days from now
          },
        },
      };
    },

    refreshToken: async (token: string) => {
      // This should use a proper refresh token API call
      // For now we'll just implement the expected interface
      try {
        // This is a placeholder - the real implementation would use the API
        return { accessToken: 'new-token' };
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    },

    logout: async () => {
      await adapter.logout();
    },

    getUserProfile: async () => {
      return adapter.getUserProfile();
    },
  };

  // Use the shared hook with platform-specific implementations
  return useAuth({
    storage,
    api: authApi,
    autoLogin,
  });
}

export default useSharedAuth;
