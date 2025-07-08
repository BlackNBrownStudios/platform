'use client';

import React from 'react';
import { CardManager } from 'history-time-shared';

// Simple demo component to test CardManager integration
const SimpleCardManagerDemo: React.FC = () => {
  // Sample cards for testing
  const testCards = [
    {
      id: '1',
      title: 'World War II Begins',
      description: 'Germany invades Poland',
      date: '1939-09-01',
      year: 1939,
      category: 'War',
      difficulty: 'medium' as const,
    },
    {
      id: '2',
      title: 'Moon Landing',
      description: 'Apollo 11 lands on the moon',
      date: '1969-07-20',
      year: 1969,
      category: 'Space',
      difficulty: 'medium' as const,
    },
    {
      id: '3',
      title: 'Fall of Berlin Wall',
      description: 'Berlin Wall falls, ending division of Germany',
      date: '1989-11-09',
      year: 1989,
      category: 'Politics',
      difficulty: 'medium' as const,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">CardManager Demo</h1>

      <CardManager
        cards={testCards}
        maxPositions={3}
        onCardPlace={(card, position) => {
          console.log(`Placed "${card.title}" at position ${position}`);
        }}
        onSelectionChange={(card) => {
          console.log(`Selected: ${card?.title || 'None'}`);
        }}
      >
        {({ state, actions }) => (
          <div className="space-y-6">
            {/* Status Display */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Game Status</h3>
              <p>Selected Card: {state.selectedCard?.title || 'None'}</p>
              <p>
                Cards Placed: {state.placedCards.length} / {testCards.length}
              </p>
              <p>Cards Available: {state.availableCards.length}</p>
            </div>

            {/* Timeline Slots */}
            <div>
              <h3 className="font-semibold mb-4">Timeline (Click to Place Cards)</h3>
              <div className="flex gap-4">
                {Array.from({ length: 3 }, (_, index) => {
                  const placedCard = actions.getCardAtPosition(index);
                  const isOccupied = actions.isPositionOccupied(index);

                  return (
                    <div
                      key={index}
                      className={`
                        w-40 h-32 border-2 border-dashed rounded-lg p-4 cursor-pointer
                        flex items-center justify-center text-center transition-colors
                        ${
                          isOccupied
                            ? 'border-green-500 bg-green-50'
                            : state.selectedCard
                              ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                              : 'border-gray-300 bg-gray-50'
                        }
                      `}
                      onClick={() => {
                        if (state.selectedCard && !isOccupied) {
                          actions.placeCard(index);
                        } else if (isOccupied) {
                          actions.removeCard(index);
                        }
                      }}
                    >
                      {placedCard ? (
                        <div>
                          <p className="font-semibold text-sm">{placedCard.title}</p>
                          <p className="text-xs text-gray-600">{placedCard.year}</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <p className="text-sm">Position {index + 1}</p>
                          {state.selectedCard && <p className="text-xs">Click to place</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Cards */}
            <div>
              <h3 className="font-semibold mb-4">Available Cards (Click to Select)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {state.availableCards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${
                        state.selectedCard?.id === card.id
                          ? 'border-blue-500 bg-blue-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
                      }
                    `}
                    onClick={() => actions.selectCard(card)}
                  >
                    <h4 className="font-semibold text-sm mb-2">{card.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{card.year}</p>
                    <p className="text-xs text-gray-700">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={actions.clearSelection}
                disabled={!state.selectedCard}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Selection
              </button>

              <button
                onClick={actions.resetCards}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reset Game
              </button>

              {state.placedCards.length === testCards.length && (
                <button
                  onClick={() => alert('Game Complete!')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Complete Game
                </button>
              )}
            </div>
          </div>
        )}
      </CardManager>
    </div>
  );
};

export default SimpleCardManagerDemo;
