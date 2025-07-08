'use client';

import React from 'react';
import { Card as CardType } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface TimelineProps {
  slots: number;
  placedCards: {
    card: CardType;
    position: number;
  }[];
  onDrop: (position: number) => void;
  onDragOver: (event: React.DragEvent) => void;
  onSlotClick?: (position: number) => void;
  highlightedSlot?: number | null;
}

const Timeline: React.FC<TimelineProps> = ({
  slots,
  placedCards,
  onDrop,
  onDragOver,
  onSlotClick,
  highlightedSlot,
}) => {
  // Access the theme styles
  const { styles } = useTheme();

  // Create an array of slots based on the count
  const timelineSlots = Array.from({ length: slots }, (_, i) => i + 1);

  // Find which card is in each position
  const getCardAtPosition = (position: number) => {
    return placedCards.find((item) => item.position === position)?.card;
  };

  // Handle drop on a specific timeline slot
  const handleDrop = (position: number) => (event: React.DragEvent) => {
    event.preventDefault();
    // Call the parent component's onDrop with the position
    onDrop(position);
  };

  // Handle drag over to allow dropping
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    onDragOver(event);
  };

  // Handle click on a timeline slot
  const handleSlotClick = (position: number) => () => {
    if (onSlotClick && !getCardAtPosition(position)) {
      onSlotClick(position);
    }
  };

  return (
    <div className="w-full my-8">
      <div
        className="relative w-full h-2 rounded-full mb-4"
        style={{ background: styles.background }}
      >
        {/* Timeline points */}
        {timelineSlots.map((position) => (
          <div
            key={position}
            className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/4"
            style={{
              backgroundColor: styles.timelineColor,
              left: `${((position - 1) / (slots - 1)) * 100}%`,
              top: '50%',
            }}
          />
        ))}
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-max" style={{ width: `max(100%, ${slots * 80}px)` }}>
          {timelineSlots.map((position) => {
            const card = getCardAtPosition(position);

            return (
              <div
                key={position}
                className={`
                  flex flex-col items-center drop-target
                  ${
                    !card
                      ? 'border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-2 h-24'
                      : ''
                  }
                  ${
                    !card && highlightedSlot === position
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                      : ''
                  }
                  ${!card ? 'cursor-pointer' : ''}
                `}
                style={{ width: `${100 / slots}%`, minWidth: '80px' }}
                onDrop={!card ? handleDrop(position) : undefined}
                onDragOver={!card ? handleDragOver : undefined}
                onClick={!card ? handleSlotClick(position) : undefined}
                aria-label={
                  !card
                    ? `Place card at position ${position}`
                    : `Position ${position}: ${card.title}`
                }
                role={!card ? 'button' : undefined}
                tabIndex={!card ? 0 : undefined}
              >
                {card ? (
                  <div className="text-center">
                    <div className="text-xs font-semibold mb-1" style={{ color: styles.text }}>
                      {card.year}
                    </div>
                    <div className="text-xs truncate max-w-full" style={{ color: styles.text }}>
                      {card.title}
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-center text-gray-400 dark:text-gray-600 flex items-center justify-center h-full"
                    style={{ color: styles.text }}
                  >
                    <span className="text-sm">Drop here</span>
                  </div>
                )}
                <div className="text-xs mt-2" style={{ color: styles.text }}>
                  {position}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
