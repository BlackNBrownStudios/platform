'use client';

import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../services/api';
import Card from './Card';
import Timeline from './Timeline';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import styles from '../styles/GameBoard.module.css';

// Component props
interface LocalTimelineGameBoardProps {
  cards: CardType[];
  onGameEnd?: (results: {
    player1Score: number;
    player2Score: number;
    winner: string;
    totalTime: number;
  }) => void;
}

// Player interface
interface Player {
  id: string;
  name: string;
  score: number;
  correctPlacements: number;
  incorrectPlacements: number;
  cards: CardType[];
}

// Timeline card placement
interface TimelineCardPlacement {
  card: CardType;
  position: number;
  placedBy: string;
}

const LocalTimelineGameBoard: React.FC<LocalTimelineGameBoardProps> = ({ cards, onGameEnd }) => {
  // Auth and player setup
  const { user } = useUnifiedAuth();
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');

  // Game state
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [timelineCards, setTimelineCards] = useState<TimelineCardPlacement[]>([]);
  const [draggingCard, setDraggingCard] = useState<CardType | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showSetupScreen, setShowSetupScreen] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Constants
  const timelineSlots = 10; // Number of slots on timeline

  // Game timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (gameStarted && !gameOver) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameStarted, gameOver, gameStartTime]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Initialize game
  const startGame = () => {
    if (!cards || cards.length < 2) {
      console.error('Not enough cards to start game');
      return;
    }

    // Shuffle cards
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

    // Reserve one card as starting card
    const startingCard = shuffledCards.pop();

    // Create player hands (up to 5 cards each)
    const cardsPerPlayer = Math.min(5, Math.floor(shuffledCards.length / 2));
    const player1Cards = shuffledCards.slice(0, cardsPerPlayer);
    const player2Cards = shuffledCards.slice(cardsPerPlayer, cardsPerPlayer * 2);

    // Create players
    const initialPlayers: Player[] = [
      {
        id: 'player1',
        name: user?.name || 'Player 1',
        score: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        cards: player1Cards,
      },
      {
        id: 'player2',
        name: player2Name,
        score: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        cards: player2Cards,
      },
    ];

    // Initialize game state
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setGameStartTime(Date.now());
    setGameStarted(true);

    // Place starting card on timeline
    if (startingCard) {
      setTimelineCards([
        {
          card: startingCard,
          position: Math.floor(timelineSlots / 2),
          placedBy: 'system',
        },
      ]);
    }

    // Hide setup screen
    setShowSetupScreen(false);

    console.log('Game started with players:', JSON.stringify(initialPlayers));
  };

  // Handle card drag start
  const handleDragStart = (event: React.DragEvent, card: CardType) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ id: card.id }));
    setDraggingCard(card);
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Get correct position for card
  const getCorrectTimelinePosition = (
    card: CardType,
    placedCards: TimelineCardPlacement[]
  ): number => {
    if (placedCards.length === 0) {
      return Math.floor(timelineSlots / 2);
    }

    // Sort timeline cards by year
    const sortedCards = [...placedCards].sort((a, b) => a.card.year - b.card.year);
    const cardYear = card.year;

    // Check if it's earlier than the earliest card
    if (cardYear < sortedCards[0].card.year) {
      return 0;
    }

    // Check if it's later than the latest card
    if (cardYear > sortedCards[sortedCards.length - 1].card.year) {
      return timelineSlots - 1;
    }

    // Find where it belongs in the timeline
    for (let i = 0; i < sortedCards.length - 1; i++) {
      const currentCard = sortedCards[i];
      const nextCard = sortedCards[i + 1];

      if (cardYear >= currentCard.card.year && cardYear <= nextCard.card.year) {
        const currentPos = currentCard.position;
        const nextPos = nextCard.position;

        if (nextPos - currentPos <= 1) {
          return -1; // Need to reorganize
        }

        return Math.floor((currentPos + nextPos) / 2);
      }
    }

    return Math.floor(timelineSlots / 2);
  };

  // Reorganize timeline
  const reorganizeTimeline = (newCard: CardType): TimelineCardPlacement[] => {
    const allCards = [...timelineCards.map((tc) => tc.card), newCard];

    // Sort by year
    allCards.sort((a, b) => a.year - b.year);

    // Assign positions
    return allCards.map((card, index) => {
      const existingPlacement = timelineCards.find((tc) => tc.card.id === card.id);

      return {
        card,
        position: Math.floor(((index + 1) * timelineSlots) / (allCards.length + 1)),
        placedBy:
          existingPlacement?.placedBy ||
          (card.id === newCard.id ? players[currentPlayerIndex].id : 'system'),
      };
    });
  };

  // Handle card drop on timeline
  const handleCardDrop = (position: number) => {
    if (!draggingCard || currentPlayerIndex >= players.length) {
      console.log('No card is being dragged or invalid player index');
      return;
    }

    // Get current player and the dragged card
    const currentPlayer = players[currentPlayerIndex];
    const card = draggingCard;

    console.log(`Player ${currentPlayer.name} is placing card ${card.title}`);

    // Find correct position
    const correctPosition = getCorrectTimelinePosition(card, timelineCards);
    const isCorrect = correctPosition === position || correctPosition === -1;

    console.log(`Card placement is ${isCorrect ? 'correct' : 'incorrect'}`);

    // Update timeline cards
    let newTimelineCards: TimelineCardPlacement[];
    if (correctPosition === -1) {
      newTimelineCards = reorganizeTimeline(card);
    } else {
      newTimelineCards = [
        ...timelineCards,
        {
          card,
          position,
          placedBy: currentPlayer.id,
        },
      ];
    }

    // Create a deep copy of the players array to modify
    const updatedPlayers = [
      ...players.map((player) => ({
        ...player,
        cards: [...player.cards], // Create new arrays for each player's cards
      })),
    ];

    // Update current player's score and stats
    if (isCorrect) {
      updatedPlayers[currentPlayerIndex].score += 100;
      updatedPlayers[currentPlayerIndex].correctPlacements += 1;
    } else {
      updatedPlayers[currentPlayerIndex].score -= 50;
      updatedPlayers[currentPlayerIndex].incorrectPlacements += 1;
    }

    // Find and remove the played card from player's hand
    const playerCardIndex = updatedPlayers[currentPlayerIndex].cards.findIndex(
      (c) => c.id === card.id
    );
    if (playerCardIndex !== -1) {
      updatedPlayers[currentPlayerIndex].cards.splice(playerCardIndex, 1);
    }

    console.log(
      `Updated ${currentPlayer.name}'s cards: ${updatedPlayers[currentPlayerIndex].cards.length} remaining`
    );

    // Update game state
    setTimelineCards(newTimelineCards);
    setPlayers(updatedPlayers);
    setDraggingCard(null);

    // Check if game over
    const allCardsPlaced = updatedPlayers.every((player) => player.cards.length === 0);
    if (allCardsPlaced) {
      console.log('Game over - all cards placed!');
      endGame(updatedPlayers);
    } else {
      // Move to next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      console.log(`Moving to player ${updatedPlayers[nextPlayerIndex].name}'s turn`);
      setCurrentPlayerIndex(nextPlayerIndex);
    }
  };

  // End game and determine winner
  const endGame = (finalPlayers: Player[]) => {
    setGameOver(true);

    const player1 = finalPlayers[0];
    const player2 = finalPlayers[1];
    let winner = 'Tie';

    if (player1.score > player2.score) {
      winner = player1.name;
    } else if (player2.score > player1.score) {
      winner = player2.name;
    }

    if (onGameEnd) {
      onGameEnd({
        player1Score: player1.score,
        player2Score: player2.score,
        winner,
        totalTime: elapsedTime,
      });
    }
  };

  // Render setup screen
  if (showSetupScreen) {
    return (
      <div className={styles.setupContainer}>
        <h2 className={styles.setupTitle}>Local 2-Player Timeline Game</h2>
        <div className={styles.playerSetup}>
          <div className={styles.playerField}>
            <label>Player 1:</label>
            <input
              type="text"
              value={user?.name || 'Player 1'}
              disabled
              className={styles.playerInput}
            />
          </div>
          <div className={styles.playerField}>
            <label>Player 2:</label>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className={styles.playerInput}
            />
          </div>
        </div>
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
        <div className={styles.gameInstructions}>
          <h3>How to Play:</h3>
          <p>
            1. Take turns placing historical event cards on the timeline in their correct
            chronological order.
          </p>
          <p>2. Correct placement: +100 points. Incorrect placement: -50 points.</p>
          <p>3. Game ends when all cards have been placed.</p>
          <p>4. The player with the highest score wins!</p>
        </div>
      </div>
    );
  }

  // Render game board
  return (
    <div className={styles.localTimelineGame}>
      {/* Game status display */}
      <div className={styles.gameStatus}>
        <h2>Timeline Game</h2>
        <div className={styles.currentTurn}>
          Current Turn:{' '}
          <span className={styles.playerName}>{players[currentPlayerIndex]?.name}</span>
        </div>
        <div className={styles.timer}>Time: {formatTime(elapsedTime)}</div>
      </div>

      {/* Timeline area */}
      <div className={styles.timelineArea}>
        <div className={styles.timelineDropZone} onDragOver={handleDragOver}>
          {Array.from({ length: timelineSlots }).map((_, i) => {
            // Find card at this position
            const cardAtPosition = timelineCards.find((tc) => tc.position === i);

            return (
              <div
                key={i}
                className={`${styles.timelineSlot} ${
                  cardAtPosition ? styles.filledSlot : styles.emptySlot
                }`}
                onDrop={() => handleCardDrop(i)}
                onDragOver={handleDragOver}
              >
                {cardAtPosition ? (
                  <div className={styles.timelineCardPlacement}>
                    <Card card={cardAtPosition.card} draggable={false} />
                    <div className={styles.placedBy}>
                      {cardAtPosition.placedBy === 'system'
                        ? 'Starting Card'
                        : `Placed by ${
                            players.find((p) => p.id === cardAtPosition.placedBy)?.name ||
                            cardAtPosition.placedBy
                          }`}
                    </div>
                  </div>
                ) : (
                  <div className={styles.dropHere}>Drop Here</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Player areas */}
      <div className={styles.playersContainer}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.playerArea} ${
              index === currentPlayerIndex ? styles.activePlayer : ''
            }`}
          >
            <div className={styles.playerInfo}>
              <h3>{player.name}</h3>
              <div className={styles.playerScore}>Score: {player.score}</div>
              <div className={styles.playerStats}>
                <span className={styles.correct}>✓ {player.correctPlacements}</span>
                <span className={styles.incorrect}>✗ {player.incorrectPlacements}</span>
              </div>
              <div className={styles.cardCount}>Cards: {player.cards.length}</div>
            </div>

            <div className={styles.playerCards}>
              {player.cards.length > 0 ? (
                player.cards.map((card) => (
                  <div
                    key={card.id}
                    className={`${styles.playerCard} ${
                      index === currentPlayerIndex
                        ? styles.currentPlayerCard
                        : styles.otherPlayerCard
                    }`}
                  >
                    {index === currentPlayerIndex ? (
                      <Card
                        card={card}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, card)}
                      />
                    ) : (
                      <div className={styles.cardBack}>
                        <span className={styles.cardBackText}>Card</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noCards}>No cards left</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Game over modal */}
      {gameOver && (
        <div className={styles.gameOverModal}>
          <h2>Game Over!</h2>
          <div className={styles.results}>
            <div className={styles.resultItem}>
              <span>{players[0].name}:</span> {players[0].score} points
            </div>
            <div className={styles.resultItem}>
              <span>{players[1].name}:</span> {players[1].score} points
            </div>
            <div className={styles.resultItem}>
              <span>Winner:</span>{' '}
              {players[0].score > players[1].score
                ? players[0].name
                : players[0].score < players[1].score
                  ? players[1].name
                  : 'Tie'}
            </div>
            <div className={styles.resultItem}>
              <span>Time:</span> {formatTime(elapsedTime)}
            </div>
          </div>
          <button
            className={styles.gameOverButton}
            onClick={() => {
              if (onGameEnd) {
                onGameEnd({
                  player1Score: players[0].score,
                  player2Score: players[1].score,
                  winner:
                    players[0].score > players[1].score
                      ? players[0].name
                      : players[0].score < players[1].score
                        ? players[1].name
                        : 'Tie',
                  totalTime: elapsedTime,
                });
              }
            }}
          >
            Return to Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default LocalTimelineGameBoard;
