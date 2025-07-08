/**
 * Shared Leaderboard Table component
 * Uses the shared hooks and formatters to ensure consistent display across platforms
 */
/* eslint-disable import/namespace, import/no-unresolved */
import React from 'react';
import { formatDate, formatScore, getRankColor } from '../../../../../shared/src/utils/formatters';
import { useSharedLeaderboard } from '../../hooks/useSharedLeaderboard';

interface LeaderboardTableProps {
  category?: string;
  timeframe?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ category, timeframe }) => {
  // Use the shared leaderboard hook to maintain consistency across platforms
  const { entries, loading, error, loadLeaderboard } = useSharedLeaderboard(category, timeframe);

  if (loading) {
    return <div className="flex justify-center p-8">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!entries || entries.length === 0) {
    return <div className="text-center p-8">No leaderboard entries found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Rank</th>
            <th className="py-2 px-4 border-b text-left">Player</th>
            <th className="py-2 px-4 border-b text-right">Score</th>
            <th className="py-2 px-4 border-b text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry: any, index: number) => {
            // Safe access to userId to prevent "entry.userId is undefined" error
            const playerName = entry.userId
              ? typeof entry.userId === 'string'
                ? entry.userId
                : entry.userId.name
              : 'Unknown Player';

            const rankColor = getRankColor(index + 1, '#6b7280');

            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">
                  <span style={{ color: rankColor }} className="font-bold">
                    {index + 1}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{playerName}</td>
                <td className="py-2 px-4 border-b text-right">{formatScore(entry.score)}</td>
                <td className="py-2 px-4 border-b text-right">{formatDate(entry.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
