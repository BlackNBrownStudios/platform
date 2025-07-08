/**
 * Adapter for the shared leaderboard hook
 * This ensures consistent leaderboard behavior between web and mobile
 */
import { useLeaderboard } from '../../../../shared/src/hooks/useLeaderboard';
import { useSharedAdapter } from '../services/sharedAdapter';

// Define the valid time frame values
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'all_time';

/**
 * Mobile-specific implementation of the shared leaderboard hook
 */
export function useSharedLeaderboard(initialCategory?: string, initialTimeFrame?: TimeFrame) {
  // Get our shared adapter
  const adapter = useSharedAdapter();

  // Use the shared hook with platform-specific implementation
  return useLeaderboard({
    fetchLeaderboard: (params: {
      category?: string;
      timeFrame?: TimeFrame;
      difficulty?: string;
      limit?: number;
    }) =>
      adapter.getLeaderboard({
        category: params.category,
        timeFrame: params.timeFrame as TimeFrame,
        difficulty: params.difficulty,
        limit: params.limit,
      }),
    initialCategory,
    initialTimeFrame,
  });
}

export default useSharedLeaderboard;
