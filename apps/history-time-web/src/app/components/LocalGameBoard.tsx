'use client';

import React from 'react';
import { Card as GameLogicCard } from '../services/api';

interface LocalGameBoardProps {
  cards: GameLogicCard[];
  onGameEnd?: () => void;
}

const LocalGameBoard: React.FC<LocalGameBoardProps> = ({ cards, onGameEnd }) => {
  // Temporarily simplified during monorepo migration
  return (
    <div className="bg-yellow-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-yellow-800 mb-3">
        🚧 Local Game Board Temporarily Disabled
      </h2>
      <p className="text-yellow-700 mb-4">
        This component is temporarily disabled during the monorepo migration. It will be restored
        once all type definitions are properly integrated.
      </p>
      <div className="text-sm text-gray-600">
        <p>Cards available: {cards.length}</p>
        {onGameEnd && <p>Game end callback: configured</p>}
      </div>
    </div>
  );
};

export default LocalGameBoard;
