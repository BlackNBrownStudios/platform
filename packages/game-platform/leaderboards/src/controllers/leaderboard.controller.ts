import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync, pick } from '@platform/backend-core';
import leaderboardService from '../services/leaderboard.service';

const createLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const leaderboard = await leaderboardService.createLeaderboard(req.body);
  res.status(httpStatus.CREATED).send(leaderboard);
});

const getLeaderboards = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['gameId', 'type', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await leaderboardService.getLeaderboardsByGame(
    filter.gameId as string,
    { ...filter, ...options }
  );
  res.send(result);
});

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const leaderboard = await leaderboardService.getLeaderboardById(req.params.leaderboardId);
  if (!leaderboard) {
    res.status(httpStatus.NOT_FOUND).send({ message: 'Leaderboard not found' });
    return;
  }
  res.send(leaderboard);
});

const updateScore = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { score, metadata } = req.body;
  const { leaderboardId } = req.params;
  const userId = req.user?.id || req.body.userId; // Allow userId in body for admin operations

  const entry = await leaderboardService.updateScore({
    leaderboardId,
    userId,
    score,
    metadata,
  });
  
  res.send(entry);
});

const getRankings = catchAsync(async (req: Request, res: Response) => {
  const { leaderboardId } = req.params;
  const { limit, page, nearUserId } = req.query;
  
  const rankings = await leaderboardService.getRankings({
    leaderboardId,
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : undefined,
    nearUserId: nearUserId as string,
  });
  
  res.send(rankings);
});

const getUserRank = catchAsync(async (req: Request, res: Response) => {
  const { leaderboardId, userId } = req.params;
  const rank = await leaderboardService.getUserRank(leaderboardId, userId);
  
  res.send({ userId, leaderboardId, rank });
});

const resetLeaderboard = catchAsync(async (req: Request, res: Response) => {
  await leaderboardService.resetLeaderboard(req.params.leaderboardId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteLeaderboard = catchAsync(async (req: Request, res: Response) => {
  await leaderboardService.deleteLeaderboard(req.params.leaderboardId);
  res.status(httpStatus.NO_CONTENT).send();
});

const leaderboardController = {
  createLeaderboard,
  getLeaderboards,
  getLeaderboard,
  updateScore,
  getRankings,
  getUserRank,
  resetLeaderboard,
  deleteLeaderboard,
};

export default leaderboardController;