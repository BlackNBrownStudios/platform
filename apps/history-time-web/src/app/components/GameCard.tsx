'use client';

import React from 'react';
import { Card } from '../services/api';
import styles from '../styles/GameCard.module.css';
import Image from 'next/image';

interface GameCardProps {
  card: Card;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ card, isFlipped, isMatched, onClick }) => {
  // Handle click event
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <div
      className={`${styles.gameCard} ${isFlipped ? styles.flipped : ''} ${
        isMatched ? styles.matched : ''
      }`}
      onClick={handleClick}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.cardLogo}>
            <span>History Time</span>
          </div>
        </div>
        <div className={styles.cardBack}>
          {card.imageUrl ? (
            <div className={styles.cardImage}>
              <Image src={card.imageUrl} alt={card.title} fill style={{ objectFit: 'cover' }} />
            </div>
          ) : null}
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardYear}>{card.year}</p>
            {card.description && <p className={styles.cardDescription}>{card.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
