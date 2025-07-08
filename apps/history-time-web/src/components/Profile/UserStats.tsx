'use client';

import React, { useEffect, useState } from 'react';
// import { formatDate, formatScore } from '@history-time/core-game';
// Temporary formatters during migration
const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();
const formatScore = (score: number) => score.toLocaleString();
import { useSharedGame } from '../../hooks/useSharedGame';
import { sharedApiService } from '../../services/sharedAdapter';

interface GameStatistics {
  totalGames: number;
  completedGames: number;
  abandonedGames: number;
  averageScore: number;
  bestScore: number;
  totalTimePlayed: number; // in minutes
  favoriteCategory?: string;
}

interface RecentGame {
  id: string;
  score: number;
  difficulty: string;
  status: string;
  createdAt: string;
  category?: string;
}

interface UserStatsProps {
  userId: string;
}

/**
 * User Statistics Component
 * Displays user game statistics and recent game history
 * Uses shared hooks and formatters for consistency with mobile
 */
export default function UserStats({ userId }: UserStatsProps) {
  const gameState = useSharedGame();
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchUserStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user game statistics from API
        const statsData = await sharedApiService.getUserGameStats(userId);
        setStatistics(statsData);

        // Fetch recent games
        const recentGamesData = await sharedApiService.getUserRecentGames(userId);
        setRecentGames(recentGamesData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user statistics:', err);
        setError('Failed to load user statistics. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserStatistics();
  }, [userId]);

  // Format time from minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    }

    return `${hours} hr ${mins} min`;
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
  }

  if (!statistics) {
    return <div className="text-gray-500 italic">No statistics available yet.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Total Games</p>
          <p className="text-2xl font-bold">{statistics.totalGames}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-bold">{statistics.completedGames}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Best Score</p>
          <p className="text-2xl font-bold">{formatScore(statistics.bestScore)}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Avg Score</p>
          <p className="text-2xl font-bold">{formatScore(statistics.averageScore)}</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Time Played</p>
          <p className="text-2xl font-bold">{formatTime(statistics.totalTimePlayed)}</p>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Favorite Category</p>
          <p className="text-2xl font-bold">{statistics.favoriteCategory || 'N/A'}</p>
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Games</h3>

        {recentGames.length === 0 ? (
          <p className="text-gray-500 italic">No recent games found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Difficulty</th>
                  <th className="py-2 px-4 border-b text-right">Score</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{formatDate(game.createdAt)}</td>
                    <td className="py-2 px-4 border-b">{game.category || 'Mixed'}</td>
                    <td className="py-2 px-4 border-b capitalize">{game.difficulty}</td>
                    <td className="py-2 px-4 border-b text-right">{formatScore(game.score)}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          game.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : game.status === 'abandoned'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Achievement Progress */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Achievements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="font-medium mb-2">History Master</h4>
            <p className="text-sm text-gray-600 mb-3">Complete 10 games in the History category</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.min((statistics.completedGames / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{statistics.completedGames}/10 games</p>
          </div>

          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="font-medium mb-2">High Scorer</h4>
            <p className="text-sm text-gray-600 mb-3">Achieve a score of 1000+ points</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${Math.min((statistics.bestScore / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatScore(statistics.bestScore)}/1000 points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
