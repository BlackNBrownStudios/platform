'use client';

/**
 * Adapter for the shared game hook
 * This ensures consistent game behavior between web and mobile
 */
// import { useGame } from '@history-time/core-game';
// Temporary game hook during migration
const useGame = (gameApi: any) => ({
  currentGame: null,
  loading: false,
  error: null,
  startGame: async (difficulty: string, options?: any) => {},
  endGame: async () => {},
  saveGame: async () => {},
  createGame: async (difficulty: string, cardCount?: number, categories?: string[]) => {},
  updateCardPlacement: async (
    gameId: string,
    cardId: string,
    position: number,
    timeTaken: number
  ) => {},
  abandonGame: async (gameId: string) => {},
});
import { sharedApiService } from '../services/sharedAdapter';

/**
 * Simplified game hook during monorepo migration
 */

import { useState } from 'react';

export function useSharedGame() {
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = async (difficulty: string, cardCount?: number, categories?: string[]) => {
    setLoading(true);
    try {
      console.log('Game creation temporarily disabled during migration', {
        difficulty,
        cardCount,
        categories,
      });
      setError(null);
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async (difficulty: string, options?: any) => {
    await createGame(difficulty, options?.cardCount, options?.categories);
  };

  const endGame = async () => {
    setLoading(true);
    try {
      setCurrentGame(null);
      setError(null);
    } catch (err) {
      setError('Failed to end game');
    } finally {
      setLoading(false);
    }
  };

  const updateCardPlacement = async (
    gameId: string,
    cardId: string,
    position: number,
    timeTaken: number
  ) => {
    console.log('Card placement update temporarily disabled during migration', {
      gameId,
      cardId,
      position,
      timeTaken,
    });
  };

  const abandonGame = async (gameId: string) => {
    console.log('Game abandonment temporarily disabled during migration', gameId);
  };

  return {
    currentGame,
    loading,
    error,
    startGame,
    endGame,
    createGame,
    updateCardPlacement,
    abandonGame,
  };
}

export default useSharedGame;
