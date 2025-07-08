/**
 * Adapter for the shared cards hook
 * This ensures consistent card behavior between web and mobile
 */
import { useCards } from '../../../../shared/src/hooks/useCards';
import { useSharedAdapter } from '../services/sharedAdapter';

/**
 * Mobile-specific implementation of the shared cards hook
 */
export function useSharedCards(
  initialCategory?: string,
  initialDifficulty?: string,
  defaultPageSize = 20
) {
  // Get our shared adapter
  const adapter = useSharedAdapter();

  // Create the API object expected by the shared hook
  const cardsApi = {
    getCards: async (params?: {
      category?: string;
      difficulty?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await adapter.getCards(params);

      // Return the response in the format expected by the shared hook
      return {
        results: response.results || [],
        totalResults: response.totalResults || 0,
        page: response.page || params?.page || 1,
        limit: response.limit || params?.limit || defaultPageSize,
      };
    },

    getRandomCards: async (params: { category?: string; difficulty?: string; count?: number }) => {
      return adapter.getRandomCards(params);
    },

    getCategories: async () => {
      return adapter.getCategories();
    },
  };

  // Use the shared hook with mobile-specific implementations
  return useCards({
    api: cardsApi,
    initialCategory,
    initialDifficulty,
    defaultPageSize,
  });
}

export default useSharedCards;
