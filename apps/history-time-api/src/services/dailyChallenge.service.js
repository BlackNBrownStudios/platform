const httpStatus = require('http-status');

const logger = require('../config/logger');
const { DailyChallenge, User, StoreItem } = require('../models');
const { ApiError } = require('@platform/backend-core');

/**
 * Get today's challenge (creates one if it doesn't exist)
 * @returns {Promise<DailyChallenge>}
 */
const getTodayChallenge = async () => {
  // Check if today's challenge exists
  let challenge = await DailyChallenge.getTodayChallenge();

  // If no challenge for today, generate one
  if (!challenge) {
    try {
      challenge = await DailyChallenge.generateTodayChallenge();
      logger.info(`Generated new daily challenge: ${challenge.title}`);
    } catch (error) {
      logger.error('Error generating daily challenge:', error);
      return null;
    }
  }

  return challenge;
};

/**
 * Get challenge by id
 * @param {ObjectId} id
 * @returns {Promise<DailyChallenge>}
 */
const getChallengeById = async (id) => {
  return DailyChallenge.findById(id);
};

/**
 * Create a new challenge
 * @param {Object} challengeData
 * @returns {Promise<DailyChallenge>}
 */
const createChallenge = async (challengeData) => {
  // If setting as today's challenge, ensure date is today
  if (challengeData.setAsToday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    challengeData.date = today;
    delete challengeData.setAsToday;

    // Check if a challenge already exists for today
    const existingChallenge = await DailyChallenge.getTodayChallenge();
    if (existingChallenge) {
      // Deactivate the existing challenge
      await DailyChallenge.findByIdAndUpdate(existingChallenge._id, { active: false });
    }
  }

  return DailyChallenge.create(challengeData);
};

/**
 * Query for challenges
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryChallenges = async (filter, options) => {
  const challenges = await DailyChallenge.paginate(filter, options);
  return challenges;
};

/**
 * Update challenge by id
 * @param {ObjectId} challengeId
 * @param {Object} updateBody
 * @returns {Promise<DailyChallenge>}
 */
const updateChallengeById = async (challengeId, updateBody) => {
  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  // If changing to today's challenge, update date
  if (updateBody.setAsToday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    updateBody.date = today;
    delete updateBody.setAsToday;

    // Check if a different challenge already exists for today
    const existingChallenge = await DailyChallenge.getTodayChallenge();
    if (existingChallenge && existingChallenge._id.toString() !== challengeId) {
      // Deactivate the existing challenge
      await DailyChallenge.findByIdAndUpdate(existingChallenge._id, { active: false });
    }
  }

  Object.assign(challenge, updateBody);
  await challenge.save();
  return challenge;
};

/**
 * Delete challenge by id
 * @param {ObjectId} challengeId
 * @returns {Promise<DailyChallenge>}
 */
const deleteChallengeById = async (challengeId) => {
  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }
  await challenge.remove();
  return challenge;
};

/**
 * Award challenge rewards to a user
 * @param {ObjectId} userId
 * @param {Object} challenge
 * @param {Object} game
 * @returns {Promise<Object>}
 */
const awardChallengeRewards = async (userId, challenge, game) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Calculate score percentage
  const scorePercentage = game.score / game.maxPossibleScore;

  // Base reward is challenge reward
  let coinsAwarded = challenge.rewardCoins;

  // Add bonus based on score (up to 50% extra)
  const scoreBonus = Math.floor(challenge.rewardCoins * scorePercentage * 0.5);
  coinsAwarded += scoreBonus;

  // Add reward to user
  user.rewards.coins += coinsAwarded;

  // Mark daily challenge as completed
  user.rewards.dailyChallengeCompleted = true;
  user.rewards.dailyChallengeDate = new Date();

  // Handle special reward if present and user did well (scored at least 70%)
  let specialRewardGranted = false;
  let specialRewardItem = null;

  if (
    challenge.specialReward &&
    challenge.specialReward.itemType !== 'none' &&
    challenge.specialReward.itemId &&
    scorePercentage >= 0.7
  ) {
    const itemType = challenge.specialReward.itemType;
    const itemId = challenge.specialReward.itemId;

    // Check if user already has this item
    if (!user.inventory[itemType].includes(itemId)) {
      // Add item to user's inventory
      user.inventory[itemType].push(itemId);
      specialRewardGranted = true;

      // Get item details to return
      try {
        specialRewardItem = await StoreItem.findOne({ itemId });
      } catch (error) {
        logger.error(`Error finding special reward item: ${error.message}`);
      }
    }
  }

  await user.save();

  return {
    coinsAwarded,
    totalCoins: user.rewards.coins,
    specialRewardGranted,
    specialRewardItem,
  };
};

module.exports = {
  getTodayChallenge,
  getChallengeById,
  createChallenge,
  queryChallenges,
  updateChallengeById,
  deleteChallengeById,
  awardChallengeRewards,
};
