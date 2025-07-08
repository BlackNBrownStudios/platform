'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { apiService, Card } from '../services/api';
import LocalTimelineGameBoard from '../components/LocalTimelineGameBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/LocalGame.module.css';

interface GameResults {
  player1Score: number;
  player2Score: number;
  winner: string;
  totalTime: number;
}

const LocalGamePage: React.FC = () => {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  useEffect(() => {
    // Fetch random cards for the game
    const fetchCards = async () => {
      try {
        setLoading(true);
        // Get 12 random cards for timeline game (6 per player)
        const randomCards = await apiService.getRandomCards({
          count: 12,
          difficulty: 'medium',
        });
        setCards(randomCards);
      } catch (err) {
        console.error('Failed to fetch cards:', err);
        setError('Failed to load cards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleGameEnd = (results: GameResults) => {
    setGameResults(results);
    setGameFinished(true);
  };

  const playAgain = () => {
    // Reset game state and fetch new cards
    setGameFinished(false);
    setGameResults(null);
    setLoading(true);

    apiService
      .getRandomCards({
        count: 12,
        difficulty: 'medium',
      })
      .then((randomCards) => {
        setCards(randomCards);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch new cards:', err);
        setError('Failed to load new cards. Please try again.');
        setLoading(false);
      });
  };

  const goToHome = () => {
    router.push('/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={goToHome}>Go Back Home</button>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className={styles.gameFinishedContainer}>
        <h2>Game Completed!</h2>
        {gameResults && (
          <div className={styles.resultsContainer}>
            <div className={styles.resultItem}>
              <span>Winner: </span>
              {gameResults.winner}
            </div>
            <div className={styles.resultItem}>
              <span>Player 1 Score: </span>
              {gameResults.player1Score}
            </div>
            <div className={styles.resultItem}>
              <span>Player 2 Score: </span>
              {gameResults.player2Score}
            </div>
            <div className={styles.resultItem}>
              <span>Total Time: </span>
              {Math.floor(gameResults.totalTime / 60)}:
              {(gameResults.totalTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
        <div className={styles.buttonContainer}>
          <button onClick={playAgain}>Play Again</button>
          <button onClick={goToHome}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.localGamePageContainer}>
      <h1>Local 2-Player Timeline Game</h1>
      <p className={styles.gameInstructions}>
        Take turns placing historical events on the timeline in their correct chronological
        position. Score points for correct placements and see who knows history better!
      </p>
      <LocalTimelineGameBoard cards={cards} onGameEnd={handleGameEnd} />
    </div>
  );
};

export default LocalGamePage;
