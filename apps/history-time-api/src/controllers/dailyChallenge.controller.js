const httpStatus = require('http-status');

const { dailyChallengeService, gameService, userService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');

const getTodayChallenge = catchAsync(async (req, res) => {
  // Get or generate today's challenge
  const challenge = await dailyChallengeService.getTodayChallenge();
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No daily challenge available for today');
  }
  res.send(challenge);
});

const startDailyChallenge = catchAsync(async (req, res) => {
  const { userId } = req;

  // Get today's challenge
  const challenge = await dailyChallengeService.getTodayChallenge();
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No daily challenge available for today');
  }

  // Create a game with the challenge settings
  const gameOptions = {
    difficulty: challenge.difficulty,
    cardCount: challenge.cardCount,
    categories: challenge.categories,
    isDailyChallenge: true,
    dailyChallengeId: challenge._id,
  };

  const { game, imageMapping } = await gameService.createGame(
    userId,
    gameOptions,
    req.body.preloadImages
  );

  // Return game data with challenge info
  res.status(httpStatus.CREATED).send({
    game,
    imageMapping,
    challenge: {
      title: challenge.title,
      description: challenge.description,
      rewardCoins: challenge.rewardCoins,
      hasSpecialReward: challenge.specialReward.itemType !== 'none',
    },
  });
});

const completeDailyChallenge = catchAsync(async (req, res) => {
  const { userId } = req;
  const { gameId } = req.params;

  // End the game first
  const game = await gameService.endGame(gameId);

  if (!game.dailyChallengeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This is not a daily challenge game');
  }

  // Get the challenge
  const challenge = await dailyChallengeService.getChallengeById(game.dailyChallengeId);
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  // Check if user has already completed this challenge
  const user = await userService.getUserById(userId);
  if (
    user.rewards.dailyChallengeCompleted &&
    user.rewards.dailyChallengeDate &&
    new Date(user.rewards.dailyChallengeDate).toDateString() === new Date().toDateString()
  ) {
    return res.send({
      message: 'Daily challenge already completed today',
      game,
      alreadyCompleted: true,
    });
  }

  // Award rewards
  const result = await dailyChallengeService.awardChallengeRewards(userId, challenge, game);

  res.send({
    message: 'Daily challenge completed',
    game,
    rewards: result,
    alreadyCompleted: false,
  });
});

const createChallenge = catchAsync(async (req, res) => {
  const challenge = await dailyChallengeService.createChallenge(req.body);
  res.status(httpStatus.CREATED).send(challenge);
});

const getChallenges = catchAsync(async (req, res) => {
  const filter = req.query.active ? { active: req.query.active === 'true' } : {};
  const options = {
    sortBy: req.query.sortBy || 'date:desc',
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await dailyChallengeService.queryChallenges(filter, options);
  res.send(result);
});

const getChallenge = catchAsync(async (req, res) => {
  const challenge = await dailyChallengeService.getChallengeById(req.params.challengeId);
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }
  res.send(challenge);
});

const updateChallenge = catchAsync(async (req, res) => {
  const challenge = await dailyChallengeService.updateChallengeById(
    req.params.challengeId,
    req.body
  );
  res.send(challenge);
});

const deleteChallenge = catchAsync(async (req, res) => {
  await dailyChallengeService.deleteChallengeById(req.params.challengeId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getTodayChallenge,
  startDailyChallenge,
  completeDailyChallenge,
  createChallenge,
  getChallenges,
  getChallenge,
  updateChallenge,
  deleteChallenge,
};
