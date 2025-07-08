'use client';

import React from 'react';
// Temporarily disabled during migration
// import {
//   CardManager,
//   CardManagerRenderProps,
// } from '../../../../shared/src/components/GameLogic/CardManager';
// import { Card } from '../../../../shared/src/types';
import { useTheme } from '../../app/contexts/ThemeContext';

// Temporary type during migration
interface Card {
  id: string;
  title: string;
  year: number;
}

interface CardManagerExampleProps {
  cards: Card[];
  onGameComplete?: (placedCards: { card: Card; position: number }[]) => void;
}

const CardManagerExample: React.FC<CardManagerExampleProps> = ({ cards, onGameComplete }) => {
  const { styles } = useTheme();

  return (
    <div style={{ backgroundColor: styles.background, color: styles.text, padding: '20px' }}>
      <h2>CardManager Example (Temporarily Disabled)</h2>
      <p>This component is temporarily disabled during migration.</p>
      <p>Cards provided: {cards.length}</p>
    </div>
  );
};

export default CardManagerExample;
