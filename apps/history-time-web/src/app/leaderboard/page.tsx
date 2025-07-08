'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

interface LeaderboardEntry {
  userId:
    | {
        _id?: string;
        name?: string;
      }
    | string
    | null;
  score: number;
  correctPlacements: number;
  totalCards: number;
  totalTimeTaken: number;
  difficulty: string;
  date: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { styles } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>(
    'all_time'
  );
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await apiService.getLeaderboard({
          timeFrame,
          difficulty,
          limit: 20,
        });
        setLeaderboard(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Leaderboard loading error:', err);
        setError('Failed to load leaderboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFrame, difficulty]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ backgroundColor: styles.background, color: styles.text, minHeight: '100vh' }}>
      <Header />
      <main className="flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: styles.text }}>
              Leaderboard
            </h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded hover:opacity-90 transition"
              style={{ backgroundColor: styles.primary, color: 'white' }}
            >
              Back to Home
            </button>
          </div>

          {/* Filters */}
          <div
            className="rounded-lg shadow-md p-4 mb-6"
            style={{ backgroundColor: styles.surface }}
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: styles.text }}>
                  Time Period
                </label>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as any)}
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: styles.background,
                    color: styles.text,
                    borderColor: 'rgba(0,0,0,0.1)',
                  }}
                >
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="all_time">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: styles.text }}>
                  Difficulty
                </label>
                <select
                  value={difficulty || ''}
                  onChange={(e) => setDifficulty(e.target.value || undefined)}
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: styles.background,
                    color: styles.text,
                    borderColor: 'rgba(0,0,0,0.1)',
                  }}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div
            className="rounded-lg shadow-md overflow-hidden"
            style={{ backgroundColor: styles.surface }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div
                    className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
                    style={{ borderColor: `${styles.primary}33`, borderTopColor: 'transparent' }}
                  ></div>
                  <p className="mt-4" style={{ color: styles.text, opacity: 0.7 }}>
                    Loading leaderboard...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center" style={{ color: '#e53e3e' }}>
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 rounded hover:opacity-90 transition"
                  style={{ backgroundColor: '#e53e3e', color: 'white' }}
                >
                  Try Again
                </button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-6 text-center" style={{ color: styles.text, opacity: 0.7 }}>
                <p>No leaderboard data available for the selected filters.</p>
                <p className="mt-2">Try a different time period or difficulty level.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Player
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Accuracy
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: styles.text, opacity: 0.7 }}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? styles.surface : 'rgba(0,0,0,0.02)',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              style={{
                                fontWeight: 'bold',
                                color:
                                  index === 0
                                    ? '#FFD700'
                                    : index === 1
                                      ? '#C0C0C0'
                                      : index === 2
                                        ? '#CD7F32'
                                        : styles.text,
                              }}
                            >
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: styles.text }}>
                            {typeof entry.userId === 'object' && entry.userId
                              ? entry.userId.name || 'Anonymous'
                              : typeof entry.userId === 'string'
                                ? entry.userId
                                : 'Anonymous'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: styles.text }}>
                            {entry.score.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: styles.text }}>
                            {Math.round((entry.correctPlacements / entry.totalCards) * 100)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: styles.text }}>
                            {formatTime(entry.totalTimeTaken)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="inline-block px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: styles.primary + '15',
                              color: styles.primary,
                            }}
                          >
                            {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: styles.text, opacity: 0.8 }}>
                            {formatDate(entry.date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
