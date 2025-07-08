'use client';

/**
 * Temporary cards hook during monorepo migration
 */
import { useState } from 'react';
import { sharedApiService } from '../services/sharedAdapter';

/**
 * Simplified cards hook during migration
 */
export function useSharedCards(
  initialCategory?: string,
  initialDifficulty?: string,
  defaultPageSize = 20
) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async (category?: string) => {
    setLoading(true);
    try {
      console.log('Card loading temporarily disabled during migration', category);
      setCards([]);
      setError(null);
    } catch (err) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  return {
    cards,
    loading,
    error,
    loadCards,
    totalResults: 0,
    page: 1,
    hasMore: false,
  };
}

export default useSharedCards;
