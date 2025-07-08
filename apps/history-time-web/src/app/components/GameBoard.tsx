import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from './Card';
import Timeline from './Timeline';
import LoadingScreen from './LoadingScreen';
import { Card as CardType, Game, apiService } from '../services/api';

// Shared component - lightweight integration
let CardManager: any = null;
try {
  // CardManager = require('@history-time/ui').CardManager;
  // Temporarily disabled during migration
} catch (error) {
  console.log('CardManager not available, using fallback logic');
}

interface GameBoardProps {
  gameId?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  cardCount?: number;
  categories?: string[];
  onGameComplete?: (game: Game) => void;
}

// Stable reference for default categories to prevent useEffect re-runs
const DEFAULT_CATEGORIES: string[] = [];

const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  difficulty = 'medium',
  cardCount = 10,
  categories = DEFAULT_CATEGORIES,
  onGameComplete,
}) => {
  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageMapping, setImageMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [draggingCard, setDraggingCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [gameTimer, setGameTimer] = useState(0);
  const [placedCards, setPlacedCards] = useState<{ card: CardType; position: number }[]>([]);
  const [cardTimers, setCardTimers] = useState<Record<string, number>>({});
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // CardManager state (optional enhancement)
  const [cardManagerState, setCardManagerState] = useState<any>(null);

  // Apply temporary image URL to a card if available
  const applyTempImage = useCallback(
    (card: CardType): CardType => {
      if (imageMapping && imageMapping[card.id]) {
        return {
          ...card,
          imageUrl: imageMapping[card.id],
        };
      }
      return card;
    },
    [imageMapping]
  );

  // Load card details for a cardId (without caching to avoid infinite loops)
  const loadCardDetails = useCallback(
    async (cardId: string): Promise<CardType> => {
      try {
        const card = await apiService.getCardById(cardId);
        return applyTempImage(card);
      } catch (err) {
        console.error(`Failed to load card ${cardId}:`, err);
        throw err;
      }
    },
    [applyTempImage]
  );

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);

        // If a gameId is provided, load the existing game
        if (gameId) {
          const existingGame = await apiService.getGameById(gameId);
          setGame(existingGame);

          // Load full card details for each card

          // Set placed cards if any
          const placedCardsWithPromises = existingGame.cards
            .filter((gc) => gc.placementPosition !== null)
            .map(async (gc) => {
              // If cardId is a string, fetch the full card details
              let cardDetail: CardType;
              if (typeof gc.cardId === 'string') {
                cardDetail = await loadCardDetails(gc.cardId);
              } else {
                cardDetail = gc.cardId as CardType;
              }

              return {
                card: cardDetail,
                position: gc.placementPosition as number,
              };
            });

          // Resolve all placed card promises
          const resolvedPlacedCards = await Promise.all(placedCardsWithPromises);
          setPlacedCards(resolvedPlacedCards);

          // Set available cards (cards not yet placed)
          const availableCardsWithPromises = existingGame.cards
            .filter((gc) => gc.placementPosition === null)
            .map(async (gc) => {
              // If cardId is a string, fetch the full card details
              if (typeof gc.cardId === 'string') {
                return await loadCardDetails(gc.cardId);
              } else {
                return gc.cardId as CardType;
              }
            });

          // Resolve all available card promises
          const resolvedAvailableCards = await Promise.all(availableCardsWithPromises);
          setCards(resolvedAvailableCards);
        }
        // Otherwise create a new game
        else {
          setLoadingImages(true);
          // Create game with preloaded images
          const { game: newGame, imageMapping: tempImageMapping } = await apiService.createGame({
            difficulty,
            cardCount,
            categories: categories.length > 0 ? categories : undefined,
            preloadImages: true,
          });

          setGame(newGame);

          // Store temp image mapping if available
          if (tempImageMapping) {
            setImageMapping(tempImageMapping);
          }

          // Load full card details for each card
          const totalCards = newGame.cards.length;
          const allCardsWithPromises = newGame.cards.map(async (gc, index) => {
            // Update loading progress
            setLoadingProgress(Math.floor((index / totalCards) * 100));

            // If cardId is a string, fetch the full card details
            if (typeof gc.cardId === 'string') {
              return await loadCardDetails(gc.cardId);
            } else {
              return applyTempImage(gc.cardId as CardType);
            }
          });

          const resolvedAllCards = await Promise.all(allCardsWithPromises);
          setLoadingProgress(100);

          // Separate cards into placed and available
          const placedCardsData = newGame.cards
            .filter((gc) => gc.placementPosition !== null)
            .map((gc) => {
              // Find the full card details
              const cardDetail = resolvedAllCards.find(
                (card) => card.id === (typeof gc.cardId === 'string' ? gc.cardId : gc.cardId.id)
              );

              return {
                card: cardDetail as CardType,
                position: gc.placementPosition as number,
              };
            });

          // Set placed cards if any
          if (placedCardsData.length > 0) {
            setPlacedCards(placedCardsData);
          }

          // Set available cards (not yet placed)
          const availableCards = resolvedAllCards.filter(
            (card) => !placedCardsData.some((pc) => pc.card.id === card.id)
          );

          setCards(availableCards);
          setLoadingImages(false);
        }
      } catch (err) {
        setError('Failed to load game. Please try again.');
        console.error('Game loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();

    // Start the game timer
    gameTimerRef.current = setInterval(() => {
      setGameTimer((prev) => prev + 1);
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [gameId, difficulty, cardCount, categories, applyTempImage, loadCardDetails]);

  // Handle drag start
  const handleDragStart = (event: React.DragEvent, card: CardType) => {
    // Set the currently dragging card
    setDraggingCard(card);

    // Set the card ID in the dataTransfer
    event.dataTransfer.setData('text/plain', card.id);
  };

  // Handle card click (for selection)
  const handleCardClick = (card: CardType) => {
    // If this card is already selected, unselect it
    if (selectedCard && selectedCard.id === card.id) {
      setSelectedCard(null);
    } else {
      // Select this card
      setSelectedCard(card);
    }
  };

  // Handle timeline slot click
  const handleSlotClick = (position: number) => {
    // Only process if we have a selected card
    if (!selectedCard) return;

    // Process the card placement as if it was dropped
    const timer = cardTimers[selectedCard.id] || 0;

    // Add to placed cards with the position
    setPlacedCards((prev) => [...prev, { card: selectedCard, position }]);

    // Remove from available cards
    setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));

    // Clear the selected card
    setSelectedCard(null);

    // Check if we've placed all cards
    if (cards.length === 1) {
      // Complete the game when all cards are placed
      handleEndGame();
    }
  };

  // Handle dropping card on timeline
  const handleTimelineDrop = async (position: number) => {
    if (!draggingCard || !game) return;

    try {
      // Calculate time taken for this placement
      const timeTaken = cardTimers[draggingCard.id]
        ? Math.floor((Date.now() - cardTimers[draggingCard.id]) / 1000)
        : 0;

      // Update the placement through API
      const updatedGame = await apiService.updateCardPlacement(game.id, {
        cardId: draggingCard.id,
        placementPosition: position,
        timeTaken,
      });

      // Update game state
      setGame(updatedGame);

      // Note: Card details are already loaded when cards are placed

      // Add to placed cards
      setPlacedCards((prev) => [...prev, { card: draggingCard, position }]);

      // Remove from available cards
      setCards((prev) => prev.filter((c) => c.id !== draggingCard.id));

      // Clear dragging card
      setDraggingCard(null);

      // Check if all cards are placed
      if (cards.length === 1) {
        // This will be 1 before we filter it out
        handleEndGame();
      }
    } catch (err) {
      setError('Failed to place card. Please try again.');
      console.error('Card placement error:', err);
    }
  };

  // Handle game end
  const handleEndGame = async () => {
    if (!game) return;

    try {
      // End the game through API
      const completedGame = await apiService.endGame(game.id);
      setGame(completedGame);

      // Stop the timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }

      // Notify parent component
      if (onGameComplete) {
        onGameComplete(completedGame);
      }
    } catch (err) {
      setError('Failed to end game. Please try again.');
      console.error('Game end error:', err);
    }
  };

  // Handle abandoning the game
  const handleAbandonGame = async () => {
    if (!game) return;

    try {
      await apiService.abandonGame(game.id);

      // Stop the timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }

      // Redirect to home or show game abandoned screen
      window.location.href = '/';
    } catch (err) {
      setError('Failed to abandon game. Please try again.');
      console.error('Game abandon error:', err);
    }
  };

  // Format time display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render loading screen
  if (loading || loadingImages) {
    return (
      <LoadingScreen
        progress={loadingProgress}
        loadingImages={loadingImages}
        message={loading ? 'Loading game...' : 'Preparing images for all cards...'}
      />
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!game) {
    return <div>Something went wrong. Game not found.</div>;
  }

  // If game is completed, show results
  if (game.status === 'completed') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Game Complete!</h2>

        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">Your Score</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{game.score}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">Time Taken</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                {formatTime(game.totalTimeTaken)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">Correct Placements</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-300">
                {game.correctPlacements}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">Incorrect Placements</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-300">
                {game.incorrectPlacements}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Home
          </button>
          <button
            onClick={() => (window.location.href = '/leaderboard')}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">History Timeline</h2>
          <p className="text-gray-600 dark:text-gray-300">Difficulty: {game.difficulty}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
            <p className="text-xl font-semibold">{formatTime(gameTimer)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Cards Left</p>
            <p className="text-xl font-semibold">{cards.length}</p>
          </div>
          <button
            onClick={handleAbandonGame}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Abandon
          </button>
        </div>
      </div>

      {/* Enhanced Game Interface with optional CardManager */}
      {CardManager && cards.length > 0 ? (
        // CardManager Enhanced Mode: Provides validation and shared logic
        <CardManager
          cards={cards}
          maxPositions={cardCount}
          onCardPlace={(card: any, position: number) => {
            console.log('🎯 CardManager validation: Card placement validated');
          }}
          onSelectionChange={(newSelectedCard: any) => {
            // Optional: sync CardManager selection with game state
            if (newSelectedCard !== selectedCard) {
              setCardManagerState((prev: any) => ({ ...prev, lastSync: Date.now() }));
            }
          }}
        >
          {({ state, actions }: any) => (
            <div>
              {/* Timeline with enhanced validation */}
              <Timeline
                slots={cardCount}
                placedCards={placedCards} // Original game state for API sync
                onDrop={handleTimelineDrop} // Original API logic preserved
                onDragOver={(e: any) => e.preventDefault()}
                onSlotClick={(position: number) => {
                  // Enhanced: Original logic + CardManager validation
                  const canPlace =
                    selectedCard && !placedCards.some((p) => p.position === position);
                  if (canPlace) {
                    console.log('🎯 Enhanced placement with CardManager validation');
                    handleSlotClick(position); // Original logic
                  }
                }}
                highlightedSlot={selectedCard ? -1 : null}
              />

              {/* Enhanced card grid */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  Your Cards ({cards.length} left)
                  {state.selectedCard && (
                    <span className="text-sm text-blue-600 ml-2">
                      • Selected: {state.selectedCard.title || state.selectedCard.name}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      draggable={true}
                      onDragStart={handleDragStart} // Original drag preserved
                      onClick={(clickedCard: CardType) => {
                        // Enhanced: Both original and CardManager logic
                        handleCardClick(clickedCard); // Original
                        if (actions.selectCard) {
                          actions.selectCard(clickedCard); // CardManager
                        }
                      }}
                      isSelected={selectedCard?.id === card.id} // Original selection state
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardManager>
      ) : (
        // Fallback Mode: Original game functionality
        <div>
          <Timeline
            slots={cardCount}
            placedCards={placedCards}
            onDrop={handleTimelineDrop}
            onDragOver={(e) => e.preventDefault()}
            onSlotClick={handleSlotClick}
            highlightedSlot={selectedCard ? -1 : null}
          />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Your Cards ({cards.length} left)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  draggable={true}
                  onDragStart={handleDragStart}
                  onClick={handleCardClick}
                  isSelected={selectedCard?.id === card.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
