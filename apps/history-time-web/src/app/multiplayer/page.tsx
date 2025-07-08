'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering since this page uses API calls
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { apiService, MultiplayerGame } from '../services/api';

const MultiplayerPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesList = await apiService.getCategories();
        setAvailableCategories(categoriesList);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try refreshing.');
      }
    };

    fetchCategories();
  }, []);

  // Handle category toggle
  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  // Create a new game
  const handleCreateGame = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const game = await apiService.createMultiplayerGame({
        difficulty,
        maxPlayers,
        categories: categories.length > 0 ? categories : undefined,
        hostNickname: nickname,
      });

      router.push(`/multiplayer/game?id=${game.id}`);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing game
  const handleJoinGame = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, check if the game exists
      const game = await apiService.getMultiplayerGameByRoomCode(roomCode);

      // Then join the game
      await apiService.joinMultiplayerGame(roomCode, nickname);

      router.push(`/multiplayer/game?id=${game.id}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please check the room code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">History Time - Multiplayer</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 ${
                activeTab === 'create' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Create Game
            </button>
            <button
              className={`flex-1 py-2 ${
                activeTab === 'join' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('join')}
            >
              Join Game
            </button>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Your Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              maxLength={20}
            />
          </div>

          {activeTab === 'create' ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Players
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="2">2 Players</option>
                  <option value="3">3 Players</option>
                  <option value="4">4 Players</option>
                  <option value="6">6 Players</option>
                  <option value="8">8 Players</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Categories (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableCategories.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="w-full mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character room code"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleJoinGame}
                disabled={loading}
                className="w-full mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MultiplayerPage;
