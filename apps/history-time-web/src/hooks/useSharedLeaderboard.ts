'use client';

/**
 * Temporary leaderboard hook during monorepo migration
 */
import { useState } from 'react';
import { sharedApiService } from '../services/sharedAdapter';

/**
 * Simplified leaderboard hook during migration
 */
export function useSharedLeaderboard(category?: string, timeframe?: string) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      console.log('Leaderboard loading temporarily disabled during migration', {
        category,
        timeframe,
      });
      setEntries([]);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    error,
    loadLeaderboard,
  };
}

export default useSharedLeaderboard;
