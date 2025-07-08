'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering since this page uses WebSocket connections
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import MultiplayerGameBoard from '../../components/MultiplayerGameBoard';
import { MultiplayerGame, apiService } from '../../services/api';
import { useUnifiedAuth } from '../../hooks/useUnifiedAuth';

const MultiplayerGamePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUnifiedAuth();
  const [showResults, setShowResults] = useState(false);
  const [completedGame, setCompletedGame] = useState<MultiplayerGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get game ID from URL
  const gameId = searchParams.get('id');

  // Validate that we have a game ID
  useEffect(() => {
    if (!gameId) {
      setError('No game ID provided');
      setLoading(false);
    }
  }, [gameId]);

  // Handle game completion
  const handleGameComplete = (game: MultiplayerGame) => {
    setCompletedGame(game);
    setShowResults(true);
  };

  // Handle back to multiplayer menu
  const handleBackToMultiplayer = () => {
    router.push('/multiplayer');
  };

  // Handle back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading && !gameId) {
    return (
      <div className="flex min-h-screen flex-col items-center p-4">
        <div className="w-full max-w-6xl text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center p-4">
        <div className="w-full max-w-6xl">
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg text-center">
            <p>{error}</p>
            <button
              onClick={handleBackToMultiplayer}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Back to Multiplayer Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">History Time - Multiplayer</h1>

        {showResults && completedGame ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Complete!</h2>

            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-center mb-4">
                Winner:{' '}
                {completedGame.players.find((p) => p.userId === completedGame.winnerUserId)
                  ?.username || 'Unknown'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGame.players.map((player) => (
                  <div
                    key={player.userId}
                    className={`p-3 rounded-lg ${
                      player.userId === completedGame.winnerUserId
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <p className="font-semibold">{player.username}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Score</p>
                        <p className="font-bold">{player.score}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Correct Placements
                        </p>
                        <p className="font-bold">{player.correctPlacements}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleBackToMultiplayer}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                New Multiplayer Game
              </button>
              <button
                onClick={handleBackToHome}
                className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          gameId && <MultiplayerGameBoard gameId={gameId} onGameComplete={handleGameComplete} />
        )}
      </div>
    </main>
  );
};

export default MultiplayerGamePage;
