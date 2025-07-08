'use client';

import { useCallback } from 'react';
import { CONFIG_KEYS } from '../services/configService';

/**
 * Hook to access configuration settings for the app
 * Ensures consistent configuration across both web and mobile platforms
 */
export const useConfig = () => {
  /**
   * Get the base URL for API requests
   * @returns The base URL for API requests
   */
  const getApiBaseUrl = useCallback((): string => {
    // Check if we're in a web environment
    if (typeof window !== 'undefined') {
      // For local development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      }

      // For production web environment, use the same origin
      return window.location.origin;
    }

    // For React Native or server-side rendering
    return process.env.API_BASE_URL || 'http://localhost:5001';
  }, []);

  /**
   * Get a configuration value
   * @param key The configuration key
   * @returns The configuration value
   */
  const getConfig = useCallback((key: string): any => {
    // Try to get from localStorage
    try {
      const config = localStorage.getItem('app_config');
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error('Error reading config from localStorage', e);
    }

    // Default values when not found
    const defaults: Record<string, any> = {
      [CONFIG_KEYS.USE_MOCK_HISTORICAL_EVENTS]: false,
      [CONFIG_KEYS.USE_MOCK_CARDS]: false,
      [CONFIG_KEYS.USE_MOCK_GAMES]: false,
      [CONFIG_KEYS.OFFLINE_MODE]: false,
      [CONFIG_KEYS.CACHE_TTL]: 60 * 60 * 1000, // 1 hour
      [CONFIG_KEYS.PREFERRED_LANGUAGE]: 'en',
      [CONFIG_KEYS.THEME]: 'light',
      [CONFIG_KEYS.NOTIFICATIONS_ENABLED]: true,
    };

    return defaults[key];
  }, []);

  /**
   * Set a configuration value
   * @param key The configuration key
   * @param value The configuration value
   */
  const setConfig = useCallback((key: string, value: any): void => {
    try {
      const config = localStorage.getItem('app_config') || '{}';
      const parsed = JSON.parse(config);
      parsed[key] = value;
      localStorage.setItem('app_config', JSON.stringify(parsed));
    } catch (e) {
      console.error('Error writing config to localStorage', e);
    }
  }, []);

  return {
    getApiBaseUrl,
    getConfig,
    setConfig,
  };
};
