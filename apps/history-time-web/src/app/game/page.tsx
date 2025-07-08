'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameBoard from '../components/GameBoard';
import { Game } from '../services/api';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showResults, setShowResults] = useState(false);
  const [completedGame, setCompletedGame] = useState<Game | null>(null);

  // Get game parameters from URL or use defaults
  const gameId = searchParams.get('id') || undefined;
  const difficulty =
    (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | 'expert') || 'medium';
  const cardCount = searchParams.get('cards')
    ? parseInt(searchParams.get('cards') as string, 10)
    : 10;
  const categoriesString = searchParams.get('categories');
  const categories = categoriesString ? categoriesString.split(',') : [];

  // Handle game completion
  const handleGameComplete = (game: Game) => {
    setCompletedGame(game);
    setShowResults(true);
  };

  // Handle new game button
  const handleNewGame = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">History Time</h1>

        {showResults && completedGame ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Complete!</h2>

            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">Your Score</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {completedGame.score}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">Time Taken</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {Math.floor(completedGame.totalTimeTaken / 60)}:
                    {(completedGame.totalTimeTaken % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">Correct Placements</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-300">
                    {completedGame.correctPlacements}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">Incorrect Placements</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-300">
                    {completedGame.incorrectPlacements}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleNewGame}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        ) : (
          <GameBoard
            gameId={gameId}
            difficulty={difficulty}
            cardCount={cardCount}
            categories={categories}
            onGameComplete={handleGameComplete}
          />
        )}
      </div>
    </main>
  );
}
