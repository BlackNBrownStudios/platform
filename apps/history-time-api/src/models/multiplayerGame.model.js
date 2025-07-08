const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const multiplayerGameSchema = mongoose.Schema(
  {
    gameMode: {
      type: String,
      enum: ['timeline'],
      default: 'timeline',
    },
    status: {
      type: String,
      enum: ['waiting', 'in_progress', 'completed', 'abandoned'],
      default: 'waiting',
    },
    players: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
          required: false, // Allow anonymous players
        },
        username: {
          type: String,
          required: true,
        },
        cards: [
          {
            cardId: {
              type: mongoose.Types.ObjectId,
              ref: 'Card',
              required: true,
            },
            drawOrder: {
              type: Number,
              required: true,
            },
          },
        ],
        isActive: {
          type: Boolean,
          default: true,
        },
        score: {
          type: Number,
          default: 0,
        },
        correctPlacements: {
          type: Number,
          default: 0,
        },
        incorrectPlacements: {
          type: Number,
          default: 0,
        },
      },
    ],
    timeline: [
      {
        cardId: {
          type: mongoose.Types.ObjectId,
          ref: 'Card',
          required: true,
        },
        position: {
          type: Number,
          required: true,
        },
        placedBy: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
        placementTime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentPlayerIndex: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    maxPlayers: {
      type: Number,
      default: 4,
    },
    timeStarted: {
      type: Date,
    },
    timeEnded: {
      type: Date,
    },
    totalTimeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    categories: [String],
    discardedCards: [
      {
        cardId: {
          type: mongoose.Types.ObjectId,
          ref: 'Card',
          required: true,
        },
        discardedBy: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
        discardTime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    drawPile: [
      {
        cardId: {
          type: mongoose.Types.ObjectId,
          ref: 'Card',
          required: true,
        },
        drawOrder: {
          type: Number,
          required: true,
        },
      },
    ],
    winnerUserId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    roomCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
multiplayerGameSchema.plugin(toJSON);
multiplayerGameSchema.plugin(paginate);

/**
 * Generate a unique room code
 */
multiplayerGameSchema.statics.generateRoomCode = function () {
  // Create a 6-character alphanumeric code (excluding confusing characters)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Move to the next player's turn
 */
multiplayerGameSchema.methods.nextTurn = function () {
  console.log('Moving to next turn. Current player index:', this.currentPlayerIndex);

  // Get only active players
  const activePlayers = this.players.filter((player) => player.isActive);
  console.log('Active players count:', activePlayers.length);

  if (activePlayers.length <= 1) {
    console.log('Only one or no active players left - ending game');
    // Game should end if only one or no active players
    return this.endGame();
  }

  // Get indices of active players
  const activeIndices = [];
  for (let i = 0; i < this.players.length; i++) {
    if (this.players[i].isActive) {
      activeIndices.push(i);
    }
  }
  console.log('Active player indices:', activeIndices);

  // Find the next active player after the current one
  const currentIndexPosition = activeIndices.indexOf(this.currentPlayerIndex);

  // If current player is not in active list (unusual case), pick the first active player
  if (currentIndexPosition === -1) {
    console.log('Current player not in active list, selecting first active player');
    this.currentPlayerIndex = activeIndices[0];
    return this.save();
  }

  // Move to next active player
  const nextPosition = (currentIndexPosition + 1) % activeIndices.length;
  const nextPlayerIndex = activeIndices[nextPosition];

  console.log('Moving from player', this.currentPlayerIndex, 'to player', nextPlayerIndex);
  this.currentPlayerIndex = nextPlayerIndex;
  return this.save();
};

/**
 * Move to the next active player
 */
multiplayerGameSchema.methods.moveToNextPlayer = function () {
  let nextPlayerIndex = this.currentPlayerIndex;
  let activePlayersCount = this.players.filter((p) => p.isActive).length;

  // If no active players left, don't change anything
  if (activePlayersCount === 0) {
    return;
  }

  // Find the next active player
  for (let i = 0; i < this.players.length; i++) {
    // Start from the player after the current one
    nextPlayerIndex = (nextPlayerIndex + 1) % this.players.length;

    // Check if this player is active
    if (this.players[nextPlayerIndex].isActive) {
      // Found the next active player
      break;
    }
  }

  // Update the current player index
  this.currentPlayerIndex = nextPlayerIndex;
  console.log(`Moving to next player. New current player index: ${this.currentPlayerIndex}`);
};

/**
 * Process card placement
 */
multiplayerGameSchema.methods.placeCard = async function (playerIndex, cardId, position) {
  console.log(`Placing card ${cardId} at position ${position} by player index ${playerIndex}`);

  // Validate player index
  if (
    playerIndex < 0 ||
    playerIndex >= this.players.length ||
    !this.players[playerIndex].isActive
  ) {
    console.error(`Player at index ${playerIndex} not found or not active in this game`);
    throw new Error('Active player not found in this game');
  }

  if (playerIndex !== this.currentPlayerIndex) {
    console.error(
      `Not player index ${playerIndex}'s turn. Current player index: ${this.currentPlayerIndex}`
    );
    throw new Error("Not this player's turn");
  }

  console.log(`Player at index ${playerIndex} is placing a card`);

  // Find the card in player's hand
  const cardIndex = this.players[playerIndex].cards.findIndex(
    (c) => c.cardId.toString() === cardId.toString()
  );

  if (cardIndex === -1) {
    console.error(`Card ${cardId} not found in player's hand`);
    throw new Error("Card not found in player's hand");
  }

  // Get the actual card data to verify the placement
  const Card = mongoose.model('Card');
  const card = await Card.findById(cardId);

  if (!card) {
    console.error(`Card data not found for ID ${cardId}`);
    throw new Error('Card data not found');
  }

  console.log(`Card to place: ${card.title}, Year: ${card.year}`);

  // For the first card in the timeline, just place it
  let isCorrect = true;

  if (this.timeline.length === 0) {
    console.log('Timeline is empty, placing first card');
    // This is the first card, so it's always correct
    // Position doesn't matter for the first card
    this.timeline.push({
      cardId: cardId,
      playerId: this.players[playerIndex]._id,
      timeAdded: new Date(),
      position: 0, // First card is at position 0
    });
  } else {
    // Get all timeline cards
    const timelineCardIds = this.timeline.map((t) => t.cardId);

    const timelineCards = await Card.find({ _id: { $in: timelineCardIds } });

    console.log(`Timeline has ${timelineCards.length} cards`);

    // Check if the placement is correct by comparing years

    // Sort timeline cards by position
    const sortedTimeline = [...this.timeline].sort((a, b) => a.position - b.position);

    // Map timeline cards to their actual data objects
    const cardMap = timelineCards.reduce((acc, card) => {
      acc[card._id.toString()] = card;
      return acc;
    }, {});

    // If position is 0 (before the first card)
    if (position === 0) {
      const firstTimelineCard = cardMap[sortedTimeline[0].cardId.toString()];
      isCorrect = card.year <= firstTimelineCard.year;
      console.log(
        `Placing before first card. Card year: ${card.year}, First timeline card year: ${firstTimelineCard.year}, isCorrect: ${isCorrect}`
      );
    }
    // If position is after the last card
    else if (position >= sortedTimeline.length) {
      const lastTimelineCard = cardMap[sortedTimeline[sortedTimeline.length - 1].cardId.toString()];
      isCorrect = card.year >= lastTimelineCard.year;
      console.log(
        `Placing after last card. Card year: ${card.year}, Last timeline card year: ${lastTimelineCard.year}, isCorrect: ${isCorrect}`
      );
    }
    // If position is between two cards
    else {
      const beforeCard = cardMap[sortedTimeline[position - 1].cardId.toString()];
      const afterCard = cardMap[sortedTimeline[position].cardId.toString()];
      isCorrect = card.year >= beforeCard.year && card.year <= afterCard.year;
      console.log(
        `Placing between cards. Card year: ${card.year}, Before card year: ${beforeCard.year}, After card year: ${afterCard.year}, isCorrect: ${isCorrect}`
      );
    }

    // Place the card in the timeline at the specified position
    // Adjust positions of existing cards if needed
    if (position <= sortedTimeline.length) {
      // Increment positions of all cards at or after the insertion point
      for (const timelineCard of this.timeline) {
        if (timelineCard.position >= position) {
          timelineCard.position++;
        }
      }
    }

    // Add the new card at the specified position
    this.timeline.push({
      cardId: cardId,
      playerId: this.players[playerIndex]._id,
      timeAdded: new Date(),
      position: position,
    });
  }

  // Remove the card from the player's hand
  this.players[playerIndex].cards.splice(cardIndex, 1);

  // Update player's score
  if (isCorrect) {
    this.players[playerIndex].score += 10;
    this.players[playerIndex].correctPlacements++;
  } else {
    this.players[playerIndex].incorrectPlacements++;

    // Add a new card to the player's hand
    if (this.drawPile.length > 0) {
      const newCard = this.drawPile.shift();
      this.players[playerIndex].cards.push(newCard);
    }
  }

  // Check if the player has emptied their hand
  const playerHasEmptiedHand = this.players[playerIndex].cards.length === 0;
  let gameOver = false;

  if (playerHasEmptiedHand) {
    this.status = 'completed';
    this.winners = [playerIndex];
    this.timeCompleted = new Date();
    gameOver = true;
  } else {
    // Move to the next active player
    this.moveToNextPlayer();
  }

  await this.save();

  // Get the actual card object to return for the UI
  return {
    isCorrect,
    card,
    playerIndex,
    position,
    gameOver,
  };
};

/**
 * End the game
 */
multiplayerGameSchema.methods.endGame = async function () {
  // Set end time and calculate total time taken
  this.timeEnded = new Date();
  this.totalTimeTaken = Math.round((this.timeEnded - this.timeStarted) / 1000);

  // Update game status
  this.status = 'completed';

  // Final calculation for player scores based on cards left and other factors
  for (const player of this.players) {
    // Penalty for each remaining card
    const remainingCardsPenalty = player.cards.length * 20;
    player.score = Math.max(0, player.score - remainingCardsPenalty);

    // Winner bonus
    if (
      this.winnerUserId &&
      player.userId &&
      player.userId.toString() === this.winnerUserId.toString()
    ) {
      player.score += 500; // Winner bonus
    }
  }

  await this.save();
  return this;
};

/**
 * @typedef MultiplayerGame
 */
const MultiplayerGame = mongoose.model('MultiplayerGame', multiplayerGameSchema);

module.exports = MultiplayerGame;
