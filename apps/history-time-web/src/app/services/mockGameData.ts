/**
 * Mock Game Data
 * Provides mock data for games when not connected to the API
 */
import { v4 as uuidv4 } from 'uuid';

// Define game types that would normally come from shared
export interface Player {
  id: string;
  username: string;
  score: number;
  avatar?: string;
  isCurrentPlayer: boolean;
}

export interface GameCard {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface Game {
  id: string;
  title: string;
  status: 'waiting' | 'in_progress' | 'completed';
  players: Player[];
  cards: GameCard[];
  maxPlayers: number;
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  updatedAt: Date;
  winner?: Player;
  timePerTurn: number; // seconds
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  highestScore: number;
  cardsPlaced: number;
  averageAccuracy: number;
}

// Mock game cards
const mockGameCards: GameCard[] = [
  {
    id: '1',
    title: 'Declaration of Independence',
    year: 1776,
    description:
      'The United States Declaration of Independence was adopted by the Second Continental Congress.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/United_States_Declaration_of_Independence.jpg/800px-United_States_Declaration_of_Independence.jpg',
    category: 'Political',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '2',
    title: 'Moon Landing',
    year: 1969,
    description: 'Apollo 11 was the spaceflight that first landed humans on the Moon.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Buzz_salutes_the_U.S._Flag.jpg/800px-Buzz_salutes_the_U.S._Flag.jpg',
    category: 'Science',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '3',
    title: 'World Wide Web Invented',
    year: 1989,
    description: 'Tim Berners-Lee invented the World Wide Web while working at CERN.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/800px-First_Web_Server.jpg',
    category: 'Technology',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '4',
    title: 'Fall of the Berlin Wall',
    year: 1989,
    description:
      'The Berlin Wall fell after the East German government announced that its citizens could visit West Berlin and West Germany.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Berlin_Wall_1989.jpg/800px-Berlin_Wall_1989.jpg',
    category: 'Political',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '5',
    title: 'Printing Press Invented',
    year: 1440,
    description:
      'Johannes Gutenberg introduced the printing press to Europe, which allowed for mass production of books.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gutenberg_press.jpg/800px-Gutenberg_press.jpg',
    category: 'Technology',
    difficulty: 'hard',
    points: 150,
  },
  {
    id: '6',
    title: 'French Revolution Begins',
    year: 1789,
    description: 'The French Revolution began with the storming of the Bastille on July 14, 1789.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Anonymous_-_Prise_de_la_Bastille.jpg/800px-Anonymous_-_Prise_de_la_Bastille.jpg',
    category: 'Political',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '7',
    title: 'Penicillin Discovered',
    year: 1928,
    description: 'Alexander Fleming discovered penicillin, the first true antibiotic.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Fleming_discovering_penicillin.jpg/800px-Fleming_discovering_penicillin.jpg',
    category: 'Science',
    difficulty: 'hard',
    points: 150,
  },
  {
    id: '8',
    title: 'Construction of the Great Wall of China',
    year: -220,
    description:
      'The Great Wall of China was built to protect Chinese states and empires against raids and invasions.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    category: 'Architecture',
    difficulty: 'hard',
    points: 150,
  },
  {
    id: '9',
    title: 'American Civil War',
    year: 1861,
    description:
      'The American Civil War was fought between the Union and the Confederacy from 1861 to 1865.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Battle_of_Gettysburg%2C_by_Currier_and_Ives.png/800px-Battle_of_Gettysburg%2C_by_Currier_and_Ives.png',
    category: 'Military',
    difficulty: 'medium',
    points: 100,
  },
  {
    id: '10',
    title: 'Steam Engine Improved',
    year: 1769,
    description: 'James Watt improved the Newcomen steam engine, creating a more efficient design.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Maquina_vapor_Watt_ETSIIM.jpg/800px-Maquina_vapor_Watt_ETSIIM.jpg',
    category: 'Technology',
    difficulty: 'easy',
    points: 50,
  },
];

// Mock players
const mockPlayers: Player[] = [
  {
    id: '1',
    username: 'HistoryBuff42',
    score: 750,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=1',
    isCurrentPlayer: true,
  },
  {
    id: '2',
    username: 'TimelineExpert',
    score: 680,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=2',
    isCurrentPlayer: false,
  },
  {
    id: '3',
    username: 'HistoryTeacher101',
    score: 720,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=3',
    isCurrentPlayer: false,
  },
];

// Mock games
const mockGames: Game[] = [
  {
    id: '1',
    title: 'History Challenge #1',
    status: 'in_progress',
    players: mockPlayers,
    cards: mockGameCards.slice(0, 5),
    maxPlayers: 4,
    currentRound: 3,
    maxRounds: 5,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:30:00Z'),
    timePerTurn: 30,
  },
  {
    id: '2',
    title: 'World History Timeline',
    status: 'waiting',
    players: mockPlayers.slice(0, 1),
    cards: mockGameCards.slice(5, 10),
    maxPlayers: 3,
    currentRound: 0,
    maxRounds: 5,
    createdAt: new Date('2023-01-02T14:00:00Z'),
    updatedAt: new Date('2023-01-02T14:00:00Z'),
    timePerTurn: 45,
  },
  {
    id: '3',
    title: 'Science & Tech Through Time',
    status: 'completed',
    players: mockPlayers,
    cards: mockGameCards.filter(
      (card) => card.category === 'Science' || card.category === 'Technology'
    ),
    maxPlayers: 3,
    currentRound: 5,
    maxRounds: 5,
    createdAt: new Date('2023-01-03T09:00:00Z'),
    updatedAt: new Date('2023-01-03T10:15:00Z'),
    winner: mockPlayers[0],
    timePerTurn: 30,
  },
];

// Mock game stats
const mockGameStats: GameStats = {
  gamesPlayed: 15,
  gamesWon: 8,
  totalScore: 3200,
  highestScore: 950,
  cardsPlaced: 124,
  averageAccuracy: 87.5,
};

/**
 * Get a list of mock games
 */
export function getMockGames(): Game[] {
  return [...mockGames];
}

/**
 * Get a specific mock game by ID
 */
export function getMockGameById(id: string): Game | undefined {
  return mockGames.find((game) => game.id === id);
}

/**
 * Create a new mock game
 */
export function createMockGame(title: string, maxPlayers: number, maxRounds: number): Game {
  const newGame: Game = {
    id: uuidv4(),
    title,
    status: 'waiting',
    players: [
      {
        id: '1',
        username: 'HistoryBuff42',
        score: 0,
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=1',
        isCurrentPlayer: true,
      },
    ],
    cards: mockGameCards.slice(0, maxRounds),
    maxPlayers,
    currentRound: 0,
    maxRounds,
    createdAt: new Date(),
    updatedAt: new Date(),
    timePerTurn: 30,
  };

  mockGames.push(newGame);
  return newGame;
}

/**
 * Get mock game stats
 */
export function getMockGameStats(): GameStats {
  return { ...mockGameStats };
}

/**
 * Join a mock game
 */
export function joinMockGame(gameId: string, playerId: string, username: string): Game | undefined {
  const game = getMockGameById(gameId);

  if (game && game.status === 'waiting' && game.players.length < game.maxPlayers) {
    const newPlayer: Player = {
      id: playerId,
      username,
      score: 0,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${playerId}`,
      isCurrentPlayer: false,
    };

    game.players.push(newPlayer);
    game.updatedAt = new Date();

    return game;
  }

  return undefined;
}

/**
 * Start a mock game
 */
export function startMockGame(gameId: string): Game | undefined {
  const game = getMockGameById(gameId);

  if (game && game.status === 'waiting' && game.players.length > 0) {
    game.status = 'in_progress';
    game.currentRound = 1;
    game.updatedAt = new Date();

    return game;
  }

  return undefined;
}

/**
 * End a mock game
 */
export function endMockGame(gameId: string, winnerId: string): Game | undefined {
  const game = getMockGameById(gameId);

  if (game && game.status === 'in_progress') {
    game.status = 'completed';
    game.currentRound = game.maxRounds;
    game.updatedAt = new Date();
    game.winner = game.players.find((player) => player.id === winnerId);

    return game;
  }

  return undefined;
}

/**
 * Update the placement of a card in a mock game
 */
export const updateMockCardPlacement = (
  gameId: string,
  cardId: string,
  position: number,
  timeTaken: number = 0
): Game | undefined => {
  const game = getMockGameById(gameId);

  if (!game) {
    return undefined;
  }

  // Find the card and update its position
  const card = game.cards.find((c) => c.id === cardId);

  if (!card) {
    return undefined;
  }

  // In a real implementation, we would update the card position
  // and calculate scores, but for the mock we'll just update the player's score
  const currentPlayer = game.players.find((p) => p.isCurrentPlayer);

  if (currentPlayer) {
    // Award points based on how quickly they placed the card
    const basePoints = card.points;
    const timeBonus = Math.max(0, 10 - Math.floor(timeTaken / 1000)); // Time bonus decreases with time
    currentPlayer.score += basePoints + timeBonus;
  }

  // Update the game's timestamp
  game.updatedAt = new Date();

  return game;
};

/**
 * Abandon a mock game
 */
export const abandonMockGame = (gameId: string): { success: boolean } => {
  const gameIndex = mockGames.findIndex((g) => g.id === gameId);

  if (gameIndex === -1) {
    return { success: false };
  }

  // In a real implementation, we would mark the game as abandoned
  // or remove it from the database. For mock data, we'll just
  // mark it as completed with no winner.
  mockGames[gameIndex].status = 'completed';
  mockGames[gameIndex].updatedAt = new Date();

  return { success: true };
};

/**
 * Get mock leaderboard data
 */
export const getMockLeaderboard = (): any[] => {
  // Extract all players from all games
  const allPlayers = mockGames.flatMap((g) => g.players);

  // Create a map to aggregate scores by player ID
  const playerScores = new Map<
    string,
    { id: string; username: string; score: number; avatar?: string }
  >();

  allPlayers.forEach((player) => {
    if (playerScores.has(player.id)) {
      // Update existing player score
      const existingPlayer = playerScores.get(player.id)!;
      existingPlayer.score += player.score;
    } else {
      // Add new player
      playerScores.set(player.id, {
        id: player.id,
        username: player.username,
        score: player.score,
        avatar: player.avatar,
      });
    }
  });

  // Convert to array and sort by score
  return Array.from(playerScores.values()).sort((a, b) => b.score - a.score);
};
