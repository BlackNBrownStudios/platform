import { ApiError } from '@platform/backend-core';
import httpStatus from 'http-status';
import { Game, IGame } from '../models/game.model';

export class GameService {
  /**
   * Start a new game
   */
  async startNewGame(userId: string): Promise<IGame> {
    // Check if user has an active game
    const activeGame = await Game.findOne({ userId, isActive: true });
    if (activeGame) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You already have an active game');
    }

    // Generate random number between 1 and 100
    const targetNumber = Math.floor(Math.random() * 100) + 1;

    const game = await Game.create({
      userId,
      targetNumber,
      attempts: [],
    });

    return game;
  }

  /**
   * Make a guess
   */
  async makeGuess(gameId: string, userId: string, guess: number): Promise<{
    game: IGame;
    result: 'correct' | 'too_high' | 'too_low';
    message: string;
  }> {
    const game = await Game.findById(gameId);
    
    if (!game) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
    }

    if (game.userId.toString() !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'This is not your game');
    }

    if (!game.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'This game is already completed');
    }

    // Add guess to attempts
    game.attempts.push(guess);

    let result: 'correct' | 'too_high' | 'too_low';
    let message: string;

    if (guess === game.targetNumber) {
      result = 'correct';
      message = `Congratulations! You guessed the number in ${game.attempts.length} attempts!`;
      game.isWon = true;
      game.isActive = false;
      game.completedAt = new Date();
    } else if (guess > game.targetNumber) {
      result = 'too_high';
      message = 'Too high! Try a lower number.';
    } else {
      result = 'too_low';
      message = 'Too low! Try a higher number.';
    }

    await game.save();

    return {
      game,
      result,
      message,
    };
  }

  /**
   * Get active game for user
   */
  async getActiveGame(userId: string): Promise<IGame | null> {
    return Game.findOne({ userId, isActive: true });
  }

  /**
   * Get game history for user
   */
  async getGameHistory(userId: string): Promise<IGame[]> {
    return Game.find({ userId, isActive: false })
      .sort({ completedAt: -1 })
      .limit(10);
  }

  /**
   * Give up on current game
   */
  async giveUp(gameId: string, userId: string): Promise<IGame> {
    const game = await Game.findById(gameId);
    
    if (!game) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
    }

    if (game.userId.toString() !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'This is not your game');
    }

    if (!game.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'This game is already completed');
    }

    game.isActive = false;
    game.completedAt = new Date();
    await game.save();

    return game;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 10): Promise<any[]> {
    const leaderboard = await Game.aggregate([
      { $match: { isWon: true } },
      {
        $group: {
          _id: '$userId',
          totalGames: { $sum: 1 },
          totalScore: { $sum: '$score' },
          avgAttempts: { $avg: { $size: '$attempts' } },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          name: '$user.name',
          totalGames: 1,
          totalScore: 1,
          avgAttempts: { $round: ['$avgAttempts', 1] },
        },
      },
    ]);

    return leaderboard;
  }
}