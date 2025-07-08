/**
 * Categories Service
 * Handles loading, caching, and fallback logic for game categories
 */

import { apiService } from './api';

export interface CategoriesResult {
  categories: string[];
  isOffline: boolean;
  source: 'api' | 'cache' | 'fallback';
  error?: string;
}

class CategoriesService {
  private cache: string[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Comprehensive fallback categories based on backend data
  private readonly fallbackCategories = [
    'Cultural',
    'Economic',
    'Military',
    'Political',
    'Religious',
    'Scientific',
    'Technological',
    'Ancient History',
    'Medieval History',
    'Modern History',
    'World War',
    'Revolution',
    'Discovery',
    'Art',
    'Exploration',
    'Social',
  ].sort();

  /**
   * Get categories with intelligent fallback and retry logic
   */
  async getCategories(maxRetries = 3): Promise<CategoriesResult> {
    // Check cache first
    if (this.isValidCache()) {
      return {
        categories: this.cache!,
        isOffline: false,
        source: 'cache',
      };
    }

    // Try to load from API with retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const categories = await apiService.getCategories();

        if (categories && categories.length > 0) {
          // Success - cache the result
          this.cache = categories.sort();
          this.cacheTimestamp = Date.now();

          return {
            categories: this.cache,
            isOffline: false,
            source: 'api',
          };
        }
      } catch (error) {
        console.warn(`Categories API attempt ${attempt}/${maxRetries} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 500); // 1s, 2s, 4s
        }
      }
    }

    // All retries failed - use fallback
    console.info('Using fallback categories due to API unavailability');

    return {
      categories: this.fallbackCategories,
      isOffline: true,
      source: 'fallback',
      error: 'Server unavailable - using offline categories',
    };
  }

  /**
   * Get categories with live updates (for UI components)
   */
  async getCategoriesWithProgress(
    onProgress?: (message: string, attempt: number) => void
  ): Promise<CategoriesResult> {
    const maxRetries = 3;

    // Check cache first
    if (this.isValidCache()) {
      onProgress?.('Categories loaded from cache', 0);
      return {
        categories: this.cache!,
        isOffline: false,
        source: 'cache',
      };
    }

    // Try to load from API with progress updates
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        onProgress?.(`Connecting to server... (${attempt}/${maxRetries})`, attempt);

        const categories = await apiService.getCategories();

        if (categories && categories.length > 0) {
          this.cache = categories.sort();
          this.cacheTimestamp = Date.now();

          onProgress?.('Categories loaded successfully!', attempt);

          return {
            categories: this.cache,
            isOffline: false,
            source: 'api',
          };
        }
      } catch (error) {
        console.warn(`Categories API attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          onProgress?.(`Retrying... (${attempt}/${maxRetries})`, attempt);
          await this.sleep(1000); // 1 second between retries for UI
        }
      }
    }

    // Fallback
    onProgress?.('Using offline categories', maxRetries);

    return {
      categories: this.fallbackCategories,
      isOffline: true,
      source: 'fallback',
      error: 'Server unavailable - using offline categories',
    };
  }

  /**
   * Force refresh categories (ignores cache)
   */
  async refreshCategories(): Promise<CategoriesResult> {
    this.clearCache();
    return this.getCategories();
  }

  /**
   * Clear the categories cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get the fallback categories (for immediate UI rendering)
   */
  getFallbackCategories(): string[] {
    return [...this.fallbackCategories];
  }

  /**
   * Check if current cache is valid
   */
  private isValidCache(): boolean {
    return (
      this.cache !== null &&
      this.cacheTimestamp > 0 &&
      Date.now() - this.cacheTimestamp < this.CACHE_TTL
    );
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if a category exists in our known categories
   */
  async isCategoryValid(category: string): Promise<boolean> {
    const result = await this.getCategories();
    return result.categories.includes(category);
  }

  /**
   * Get suggested categories based on input
   */
  async getSuggestedCategories(input: string, limit = 5): Promise<string[]> {
    const result = await this.getCategories();
    const lowercaseInput = input.toLowerCase();

    return result.categories
      .filter((cat) => cat.toLowerCase().includes(lowercaseInput))
      .slice(0, limit);
  }

  /**
   * Get statistics about categories usage
   */
  getCacheStats() {
    return {
      hasCachedData: this.cache !== null,
      cacheAge: this.cache ? Date.now() - this.cacheTimestamp : 0,
      isExpired: !this.isValidCache(),
      categoriesCount: this.cache?.length || 0,
    };
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();
