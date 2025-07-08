import { useMemo } from 'react';

export function useConfig() {
  return useMemo(
    () => ({
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api',
    }),
    []
  );
}
