'use client';

import React from 'react';
import styles from '../styles/Scoreboard.module.css';

interface ScoreboardPlayer {
  id: string;
  name: string;
  score: number;
  isCurrentPlayer?: boolean;
}

interface ScoreboardProps {
  players: ScoreboardPlayer[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
  return (
    <div className={styles.scoreboardContainer}>
      <h3 className={styles.scoreboardTitle}>Scoreboard</h3>
      <div className={styles.scoresList}>
        {players.map((player) => (
          <div
            key={player.id}
            className={`${styles.playerScore} ${
              player.isCurrentPlayer ? styles.currentPlayer : ''
            }`}
          >
            <span className={styles.playerName}>{player.name}</span>
            <span className={styles.playerScoreValue}>{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;
