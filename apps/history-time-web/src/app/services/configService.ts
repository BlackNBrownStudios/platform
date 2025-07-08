/**
 * Configuration Service
 * Manages application-wide settings and feature toggles
 */

// Configuration keys
export const CONFIG_KEYS = {
  USE_MOCK_HISTORICAL_EVENTS: 'useMockHistoricalEvents',
  USE_MOCK_CARDS: 'useMockCards',
  USE_MOCK_GAMES: 'useMockGames',
  OFFLINE_MODE: 'offlineMode',
  CACHE_TTL: 'cacheTTL',
  PREFERRED_LANGUAGE: 'preferredLanguage',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
};

// Default configuration
const DEFAULT_CONFIG = {
  [CONFIG_KEYS.USE_MOCK_HISTORICAL_EVENTS]: false,
  [CONFIG_KEYS.USE_MOCK_CARDS]: false,
  [CONFIG_KEYS.USE_MOCK_GAMES]: false,
  [CONFIG_KEYS.OFFLINE_MODE]: false,
  [CONFIG_KEYS.CACHE_TTL]: 60 * 60 * 1000, // 1 hour
  [CONFIG_KEYS.PREFERRED_LANGUAGE]: 'en',
  [CONFIG_KEYS.THEME]: 'light',
  [CONFIG_KEYS.NOTIFICATIONS_ENABLED]: true,
};

// Storage key for all config
const STORAGE_KEY = 'app_config';

/**
 * Configuration Service
 * Provides methods to get and set application configuration
 */
class ConfigService {
  private config: Record<string, any> = { ...DEFAULT_CONFIG };
  private isLoaded = false;
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * Initialize the configuration service
   * Loads saved configuration from storage
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      // Server-side - use defaults
      this.config = { ...DEFAULT_CONFIG };
      this.isLoaded = true;
      return;
    }

    try {
      const storedConfig = localStorage.getItem(STORAGE_KEY);

      if (storedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Fall back to default configuration
      this.config = { ...DEFAULT_CONFIG };
      this.isLoaded = true;
    }
  }

  /**
   * Get a configuration value
   * @param key The configuration key
   * @param defaultValue Optional default value if the key doesn't exist
   */
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    if (!this.isLoaded) {
      await this.init();
    }

    return (this.config[key] !== undefined ? this.config[key] : defaultValue) as T;
  }

  /**
   * Set a configuration value
   * @param key The configuration key
   * @param value The value to set
   */
  async set<T>(key: string, value: T): Promise<void> {
    if (!this.isLoaded) {
      await this.init();
    }

    this.config[key] = value;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));

        // Notify listeners
        this.notifyListeners(key, value);
      } catch (error) {
        console.error('Failed to save configuration:', error);
        throw error;
      }
    }
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));

        // Notify all listeners
        Object.keys(this.config).forEach((key) => {
          this.notifyListeners(key, this.config[key]);
        });
      } catch (error) {
        console.error('Failed to reset configuration:', error);
        throw error;
      }
    }
  }

  /**
   * Subscribe to configuration changes
   * @param key The configuration key to watch
   * @param callback Function to call when the value changes
   * @returns Unsubscribe function
   */
  subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const keyListeners = this.listeners.get(key)!;
    keyListeners.add(callback as (value: any) => void);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(callback as (value: any) => void);
      }
    };
  }

  /**
   * Notify listeners of a configuration change
   * @param key The configuration key that changed
   * @param value The new value
   */
  private notifyListeners(key: string, value: any): void {
    const listeners = this.listeners.get(key);

    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(value);
        } catch (error) {
          console.error('Error in configuration listener:', error);
        }
      });
    }
  }

  /**
   * Toggle historical events mock data
   */
  async toggleMockHistoricalEvents(): Promise<boolean> {
    const current = await this.get<boolean>(CONFIG_KEYS.USE_MOCK_HISTORICAL_EVENTS, false);
    await this.set(CONFIG_KEYS.USE_MOCK_HISTORICAL_EVENTS, !current);
    return !current;
  }

  /**
   * Check if mock historical events is enabled
   */
  async useMockHistoricalEvents(): Promise<boolean> {
    return this.get<boolean>(CONFIG_KEYS.USE_MOCK_HISTORICAL_EVENTS, false);
  }
}

// Export a singleton instance
export const configService = new ConfigService();
