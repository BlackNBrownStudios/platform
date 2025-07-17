import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '@platform/backend-core';
import Leaderboard, { ILeaderboard } from '../models/leaderboard.model';
import LeaderboardEntry, { ILeaderboardEntry } from '../models/leaderboardEntry.model';

interface CreateLeaderboardData {
  gameId: string;
  name: string;
  description?: string;
  type?: 'global' | 'daily' | 'weekly' | 'monthly' | 'alltime';
  scoreType?: 'highest' | 'lowest' | 'cumulative';
  resetSchedule?: string;
  metadata?: Record<string, any>;
}

interface UpdateScoreData {
  leaderboardId: string;
  userId: string;
  score: number;
  metadata?: Record<string, any>;
}

interface GetRankingsOptions {
  leaderboardId: string;
  limit?: number;
  page?: number;
  nearUserId?: string;
}

class LeaderboardService {
  /**
   * Create a new leaderboard
   */
  async createLeaderboard(data: CreateLeaderboardData): Promise<ILeaderboard> {
    const leaderboard = await Leaderboard.create(data);
    return leaderboard;
  }

  /**
   * Get leaderboard by ID
   */
  async getLeaderboardById(leaderboardId: string): Promise<ILeaderboard | null> {
    return Leaderboard.findById(leaderboardId);
  }

  /**
   * Get leaderboards for a game
   */
  async getLeaderboardsByGame(gameId: string, filter: any = {}) {
    const options = {
      sortBy: 'createdAt:desc',
      limit: filter.limit || 10,
      page: filter.page || 1,
    };

    const query = { gameId, isActive: true, ...filter };
    delete query.limit;
    delete query.page;

    return Leaderboard.paginate(query, options);
  }

  /**
   * Update or create a score entry
   */
  async updateScore(data: UpdateScoreData): Promise<ILeaderboardEntry> {
    const { leaderboardId, userId, score, metadata } = data;

    // Verify leaderboard exists and is active
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Leaderboard not found');
    }
    if (!leaderboard.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Leaderboard is not active');
    }

    // Find existing entry
    let entry = await LeaderboardEntry.findOne({
      leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (entry) {
      // Update existing entry based on score type
      switch (leaderboard.scoreType) {
        case 'highest':
          if (score > entry.score) {
            entry.score = score;
            entry.achievedAt = new Date();
          }
          break;
        case 'lowest':
          if (score < entry.score) {
            entry.score = score;
            entry.achievedAt = new Date();
          }
          break;
        case 'cumulative':
          entry.score += score;
          entry.achievedAt = new Date();
          break;
      }
      
      if (metadata) {
        entry.metadata = { ...entry.metadata, ...metadata };
      }
      
      await entry.save();
    } else {
      // Create new entry
      entry = await LeaderboardEntry.create({
        leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
        userId: new mongoose.Types.ObjectId(userId),
        score,
        metadata,
        achievedAt: new Date(),
      });
    }

    // Update ranks for this leaderboard
    await this.updateRanks(leaderboardId);

    // Fetch updated entry with rank
    const updatedEntry = await LeaderboardEntry.findById(entry._id);
    return updatedEntry!;
  }

  /**
   * Get rankings for a leaderboard
   */
  async getRankings(options: GetRankingsOptions) {
    const { leaderboardId, limit = 100, page = 1, nearUserId } = options;

    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Leaderboard not found');
    }

    const sortOrder = leaderboard.scoreType === 'lowest' ? 1 : -1;

    if (nearUserId) {
      // Get rankings near a specific user
      const userEntry = await LeaderboardEntry.findOne({
        leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
        userId: new mongoose.Types.ObjectId(nearUserId),
      });

      if (!userEntry || !userEntry.rank) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found in leaderboard');
      }

      const startRank = Math.max(1, userEntry.rank - Math.floor(limit / 2));
      
      const entries = await LeaderboardEntry.find({
        leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
        rank: { $gte: startRank, $lt: startRank + limit },
      })
        .sort({ rank: 1 })
        .populate('userId', 'name email username')
        .exec();

      return {
        results: entries,
        userRank: userEntry.rank,
        totalEntries: await LeaderboardEntry.countDocuments({
          leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
        }),
      };
    } else {
      // Get top rankings
      const paginateOptions = {
        sortBy: `score:${sortOrder === 1 ? 'asc' : 'desc'}`,
        limit,
        page,
        populate: 'userId,name email username',
      };

      const result = await LeaderboardEntry.paginate(
        { leaderboardId: new mongoose.Types.ObjectId(leaderboardId) },
        paginateOptions
      );

      return result;
    }
  }

  /**
   * Get user's rank in a leaderboard
   */
  async getUserRank(leaderboardId: string, userId: string): Promise<number | null> {
    const entry = await LeaderboardEntry.findOne({
      leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    return entry?.rank || null;
  }

  /**
   * Reset a leaderboard (clear all entries)
   */
  async resetLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Leaderboard not found');
    }

    await LeaderboardEntry.deleteMany({
      leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
    });
  }

  /**
   * Update ranks for all entries in a leaderboard
   */
  private async updateRanks(leaderboardId: string): Promise<void> {
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) return;

    const sortOrder = leaderboard.scoreType === 'lowest' ? 1 : -1;

    const entries = await LeaderboardEntry.find({
      leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
    }).sort({ score: sortOrder });

    // Update ranks
    const bulkOps = entries.map((entry, index) => ({
      updateOne: {
        filter: { _id: entry._id },
        update: { rank: index + 1 },
      },
    }));

    if (bulkOps.length > 0) {
      await LeaderboardEntry.bulkWrite(bulkOps);
    }
  }

  /**
   * Delete a leaderboard
   */
  async deleteLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Leaderboard not found');
    }

    // Delete all entries first
    await LeaderboardEntry.deleteMany({
      leaderboardId: new mongoose.Types.ObjectId(leaderboardId),
    });

    // Delete the leaderboard
    await leaderboard.deleteOne();
  }
}

export default new LeaderboardService();