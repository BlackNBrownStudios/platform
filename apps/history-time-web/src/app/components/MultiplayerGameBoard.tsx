'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card as CardType, MultiplayerGame, TimelineCard, apiService } from '../services/api';
import Card from './Card';
import Timeline from './Timeline';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

interface MultiplayerGameBoardProps {
  gameId: string;
  onGameComplete?: (game: MultiplayerGame) => void;
}

const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({ gameId, onGameComplete }) => {
  const router = useRouter();
  const { user } = useUnifiedAuth();
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingCard, setDraggingCard] = useState<CardType | null>(null);
  const [gameTimer, setGameTimer] = useState(0);
  const [playerCards, setPlayerCards] = useState<CardType[]>([]);
  const [timelineCards, setTimelineCards] = useState<{ card: CardType; position: number }[]>([]);
  const [inactiveTimelineCards, setInactiveTimelineCards] = useState<CardType[]>([]);
  const [isCurrentPlayersTurn, setIsCurrentPlayersTurn] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(-1);
  const [cardDetails, setCardDetails] = useState<Record<string, CardType>>({});
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Load card details for a cardId
  const loadCardDetails = useCallback(
    async (cardId: string): Promise<CardType> => {
      // Check if we already have this card's details
      if (cardDetails[cardId]) {
        return cardDetails[cardId];
      }

      try {
        const card = await apiService.getCardById(cardId);
        // Store in our card details cache
        setCardDetails((prev) => ({
          ...prev,
          [cardId]: card,
        }));
        return card;
      } catch (err) {
        console.error(`Failed to load card ${cardId}:`, err);
        throw err;
      }
    },
    [cardDetails]
  );

  // Enhanced processGameCards function with better error handling
  const processGameCards = useCallback(
    async (game: MultiplayerGame) => {
      try {
        // Find current player's index
        let playerUserId = user?.id;
        let guestUsername: string | null = null;
        let guestUserId: string | null = null;

        // If playing as guest, we need to use the stored guest identifiers
        if (!playerUserId && typeof window !== 'undefined') {
          const guestUserData = localStorage.getItem('history_time_guest_user');
          if (guestUserData) {
            try {
              const guestUser = JSON.parse(guestUserData);
              guestUsername = guestUser.name;
              guestUserId = guestUser.id;
              console.log('Using guest data:', { id: guestUserId, name: guestUsername });
            } catch (err) {
              console.error('Error parsing guest user data:', err);
            }
          }
        }

        // Find current player's index - first try by user ID for authenticated users
        let currentPlayerIndex = playerUserId
          ? game.players.findIndex((p) => p.userId === playerUserId)
          : -1;

        // If not found and we have a guest ID, try finding by userId for guest users
        if (currentPlayerIndex === -1 && guestUserId) {
          currentPlayerIndex = game.players.findIndex(
            (p) => p.userId === guestUserId || p.userId === null
          );
        }

        // If still not found and we have a guest username, try finding by username as last resort
        if (currentPlayerIndex === -1 && guestUsername) {
          currentPlayerIndex = game.players.findIndex((p) => p.username === guestUsername);
        }

        console.log('Current player index:', currentPlayerIndex);
        console.log('User ID:', playerUserId);
        console.log('Guest User ID:', guestUserId);
        console.log('Guest Username:', guestUsername);
        console.log(
          'All players:',
          game.players.map((p) => ({ id: p.userId, name: p.username }))
        );

        setCurrentPlayerIndex(currentPlayerIndex);

        // Check if it's the current player's turn
        const isCurrentTurn =
          game.currentPlayerIndex === currentPlayerIndex && currentPlayerIndex !== -1;
        console.log(`Is current player's turn: ${isCurrentTurn}`);
        setIsCurrentPlayersTurn(isCurrentTurn);

        // If player is in the game, get their cards
        if (currentPlayerIndex !== -1) {
          const playerCardsList: CardType[] = [];

          for (const cardEntry of game.players[currentPlayerIndex].cards) {
            try {
              let cardData: CardType;

              // Handle both string IDs and full card objects
              if (typeof cardEntry.cardId === 'string') {
                try {
                  cardData = await loadCardDetails(cardEntry.cardId);
                } catch (cardErr) {
                  console.error(`Error loading card ${cardEntry.cardId}:`, cardErr);
                  // Create a temporary card with minimal data to prevent UI issues
                  cardData = {
                    id: cardEntry.cardId,
                    title: 'Loading Error',
                    description: 'Card data could not be loaded',
                    date: '',
                    year: 0,
                    category: 'Unknown',
                    difficulty: 'medium',
                  };
                }
              } else if (cardEntry.cardId && typeof cardEntry.cardId === 'object') {
                cardData = cardEntry.cardId as CardType;
              } else {
                console.error('Invalid card data:', cardEntry);
                continue; // Skip this card
              }

              playerCardsList.push(cardData);
            } catch (err) {
              console.error('Error processing player card:', err);
              // Continue with other cards even if one fails
            }
          }

          setPlayerCards(playerCardsList);
          console.log(`Loaded ${playerCardsList.length} cards for current player`);
        } else {
          setPlayerCards([]);
          console.log('Current player not found in game players list');
        }

        // Process timeline cards with better error handling
        const timelineCardsList: { card: CardType; position: number }[] = [];

        for (const timelineEntry of game.timeline) {
          try {
            let cardData: CardType;

            // Handle both string IDs and full card objects
            if (typeof timelineEntry.cardId === 'string') {
              try {
                cardData = await loadCardDetails(timelineEntry.cardId);
              } catch (cardErr) {
                console.error(`Error loading timeline card ${timelineEntry.cardId}:`, cardErr);
                // Create a temporary card with minimal data to prevent UI issues
                cardData = {
                  id: timelineEntry.cardId,
                  title: 'Loading Error',
                  description: 'Timeline card data could not be loaded',
                  date: '',
                  year: 0,
                  category: 'Unknown',
                  difficulty: 'medium',
                };
              }
            } else if (timelineEntry.cardId && typeof timelineEntry.cardId === 'object') {
              cardData = timelineEntry.cardId as CardType;
            } else {
              console.error('Invalid timeline card data:', timelineEntry);
              continue; // Skip this card
            }

            timelineCardsList.push({
              card: cardData,
              position: timelineEntry.position,
            });
          } catch (err) {
            console.error('Error processing timeline card:', err);
            // Continue with other cards even if one fails
          }
        }

        // Sort by position
        timelineCardsList.sort((a, b) => a.position - b.position);
        setTimelineCards(timelineCardsList);
        console.log(`Loaded ${timelineCardsList.length} timeline cards`);
      } catch (err) {
        console.error('Error processing game cards:', err);
        setError('Error loading game cards. Please try refreshing.');
      }
    },
    [user, loadCardDetails]
  );

  // Enhanced game refresh and state management logic
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        console.log(`Loading game data for ID: ${gameId}`);
        const gameData = await apiService.getMultiplayerGameById(gameId);
        console.log('Game data received:', gameData.status);
        setGame(gameData);
        await processGameCards(gameData);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setLoading(false);
        setNeedsRefresh(false);
      }
    };

    loadGame();

    // Start the game timer
    gameTimerRef.current = setInterval(() => {
      setGameTimer((prev) => prev + 1);
    }, 1000);

    // More frequent refresh for better synchronization (every 3 seconds)
    gameRefreshRef.current = setInterval(() => {
      setNeedsRefresh(true);
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      if (gameRefreshRef.current) {
        clearInterval(gameRefreshRef.current);
      }
    };
  }, [gameId, processGameCards]);

  // Improved refresh game logic with error handling
  useEffect(() => {
    if (needsRefresh && !loading) {
      const refreshGame = async () => {
        try {
          console.log(`Refreshing game: ${gameId}`);
          const gameData = await apiService.getMultiplayerGameById(gameId);

          // Only update if game status has changed or player turns have changed
          if (
            !game ||
            gameData.status !== game.status ||
            gameData.currentPlayerIndex !== game.currentPlayerIndex ||
            gameData.timeline.length !== game.timeline.length
          ) {
            console.log('Game state changed, updating component');
            setGame(gameData);
            await processGameCards(gameData);

            // If game is now completed and we have a callback, notify parent
            if (gameData.status === 'completed' && onGameComplete) {
              onGameComplete(gameData);
            }
          } else {
            console.log('No significant game state changes');
          }
        } catch (err) {
          console.error('Error refreshing game:', err);
          // Don't set error state for refresh failures to avoid disrupting gameplay
          // Just try again next refresh cycle
        } finally {
          setNeedsRefresh(false);
        }
      };

      refreshGame();
    }
  }, [needsRefresh, loading, gameId, game, onGameComplete, processGameCards]);

  // Improved card placement with better feedback
  const handleTimelineDrop = async (position: number) => {
    if (!draggingCard || !game || !isCurrentPlayersTurn) {
      if (!draggingCard) console.log('No dragging card');
      if (!game) console.log('No game');
      if (!isCurrentPlayersTurn) {
        console.log('Not current players turn');
        setError('It&apos;s not your turn to place a card');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    try {
      console.log(`Placing card at position ${position} in timeline`);
      const result = await apiService.placeCardMultiplayer(game.id, {
        cardId: draggingCard.id,
        position,
      });

      console.log('Card placement result:', result);

      // Update the game state with the new game data
      setGame(result.game);
      await processGameCards(result.game);

      // Provide feedback based on the result
      if (result.result?.isCorrect) {
        setError('Correct placement!');
        setTimeout(() => setError(null), 3000);
      } else {
        setError('Incorrect placement!');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error placing card:', err);
      setError('Failed to place card. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDraggingCard(null);
    }
  };

  // Handle card drag start
  const handleDragStart = (event: React.DragEvent, card: CardType) => {
    if (!isCurrentPlayersTurn) {
      event.preventDefault();
      return;
    }
    setDraggingCard(card);
  };

  // Handle abandoning the game
  const handleLeaveGame = async () => {
    if (!game) return;

    try {
      await apiService.leaveMultiplayerGame(game.id);
      router.push('/');
    } catch (err) {
      setError('Failed to leave game. Please try again.');
      console.error('Game leave error:', err);
    }
  };

  // Format time display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current player name
  const getCurrentPlayerName = (): string => {
    if (!game) return '';
    return game.players[game.currentPlayerIndex]?.username || '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Loading game...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      ) : !game ? (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
          Game not found or has been removed.
        </div>
      ) : game.status === 'waiting' ? (
        // Waiting for players view
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">Waiting for Players</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Room Code: <span className="font-bold">{game.roomCode}</span> | Players:{' '}
            {game.players.length}/{game.maxPlayers}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6 w-full">
            <h3 className="text-lg font-semibold mb-2">Players:</h3>
            <ul className="space-y-2">
              {game.players.map((player, index) => (
                <li key={index} className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${
                      player.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></span>
                  <span>
                    {player.username} {index === 0 ? '(Host)' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            {(currentPlayerIndex === 0 ||
              game.players[0]?.userId === user?.id ||
              (user?.isGuest && game.players[0]?.username === user?.name)) && (
              <button
                onClick={async () => {
                  try {
                    console.log('Attempting to start game with ID:', game.id);
                    setLoading(true);
                    // Use the enhanced API service method which now handles auth properly
                    const startedGame = await apiService.startMultiplayerGame(game.id);
                    console.log('Game started successfully:', startedGame);

                    // Update game state first to trigger re-render
                    setGame(startedGame);

                    // Process game cards, with better error handling
                    try {
                      await processGameCards(startedGame);
                      console.log('Successfully processed game cards after starting');
                    } catch (processErr) {
                      console.error('Error processing cards after game start:', processErr);
                      // Still continue as the game itself has started correctly
                    }

                    // Force a refresh to ensure UI updates
                    setNeedsRefresh(true);
                  } catch (err) {
                    console.error('Failed to start game:', err);
                    setError('Failed to start game. Need at least 2 players.');
                    setTimeout(() => setError(null), 5000);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={game.players.length < 2 || loading}
                className={`px-6 py-2 rounded transition ${
                  game.players.length < 2 || loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            )}
            <button
              onClick={handleLeaveGame}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Leave Game
            </button>
          </div>
        </div>
      ) : game.status === 'in_progress' ? (
        // Game in progress - show the actual gameplay UI
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Multiplayer Timeline</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Difficulty: {game.difficulty} | Room: {game.roomCode}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
                <p className="text-xl font-semibold">{formatTime(gameTimer)}</p>
              </div>
              <button
                onClick={handleLeaveGame}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Leave Game
              </button>
            </div>
          </div>

          {/* Current player indicator */}
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mb-6">
            <p className="text-center">
              Current Turn: <span className="font-bold">{getCurrentPlayerName()}</span>
              {isCurrentPlayersTurn && (
                <span className="ml-2 text-green-600 font-bold">(Your Turn!)</span>
              )}
            </p>
          </div>

          {/* Game board with players and timeline */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-3">Players</h3>
              <div className="space-y-3">
                {game.players.map((player, index) => (
                  <div
                    key={player.userId || index}
                    className={`p-2 rounded-lg ${
                      index === game.currentPlayerIndex
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{player.username}</span>
                      <span className="ml-1 text-sm">{player.cards.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-10">
              {/* Timeline component */}
              <Timeline
                slots={20} // Larger number for multiplayer
                placedCards={timelineCards}
                onDrop={handleTimelineDrop}
                onDragOver={(e) => e.preventDefault()}
              />

              {/* Current player's cards */}
              {playerCards.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playerCards.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        draggable={isCurrentPlayersTurn}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : game.status === 'completed' || game.status === 'abandoned' ? (
        // Game complete view
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">
            {game.status === 'completed' ? 'Game Complete!' : 'Game Abandoned'}
          </h2>

          {game.status === 'completed' && game.winnerUserId && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6 w-full">
              <h3 className="text-xl font-bold text-center mb-4">
                Winner:{' '}
                {game.players.find((p) => p.userId === game.winnerUserId)?.username || 'Unknown'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.players.map((player) => (
                  <div
                    key={player.userId || player.username}
                    className={`p-3 rounded-lg ${
                      player.userId === game.winnerUserId
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <p className="font-semibold">{player.username}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Score</p>
                        <p className="font-bold">{player.score}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Correct Placements
                        </p>
                        <p className="font-bold">{player.correctPlacements}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        // Unknown game state
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
          Unknown game state: {game.status}
        </div>
      )}
    </div>
  );
};

export default MultiplayerGameBoard;
