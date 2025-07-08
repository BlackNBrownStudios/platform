import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useAuthCore, AuthConfig, MobileStorageAdapter } from '@history-time/auth';
import { useConfig } from '../services/useConfig';

export function useUnifiedAuth() {
  const { apiUrl } = useConfig();

  const authConfig: AuthConfig = useMemo(
    () => ({
      apiUrl,
      storage: new MobileStorageAdapter(AsyncStorage),
    }),
    [apiUrl]
  );

  return useAuthCore(authConfig);
}
