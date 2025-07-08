const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const { roles } = require('../config/roles');

const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if the user doesn't use OAuth providers
        return this.authType === 'email';
      },
      trim: true,
      minlength: 8,
      validate(value) {
        if (value && (!value.match(/\d/) || !value.match(/[a-zA-Z]/))) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    authType: {
      type: String,
      enum: ['email', 'google', 'apple', 'facebook'],
      default: 'email',
    },
    oauth: {
      google: {
        id: {
          type: String,
          sparse: true,
          unique: true,
        },
        token: {
          type: String,
          private: true,
        },
        profile: {
          type: Object,
          private: true,
        },
      },
      apple: {
        id: {
          type: String,
          sparse: true,
          unique: true,
        },
        token: {
          type: String,
          private: true,
        },
        profile: {
          type: Object,
          private: true,
        },
      },
      facebook: {
        id: {
          type: String,
          sparse: true,
          unique: true,
        },
        token: {
          type: String,
          private: true,
        },
        profile: {
          type: Object,
          private: true,
        },
      },
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    stats: {
      gamesPlayed: {
        type: Number,
        default: 0,
      },
      gamesWon: {
        type: Number,
        default: 0,
      },
      highScore: {
        type: Number,
        default: 0,
      },
      totalScore: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      fastestGameTime: {
        type: Number, // in seconds
        default: 0,
      },
    },
    rewards: {
      coins: {
        type: Number,
        default: 0,
      },
      streakDays: {
        type: Number,
        default: 0,
      },
      lastDailyReward: {
        type: Date,
        default: null,
      },
      lastLoginDate: {
        type: Date,
        default: Date.now,
      },
      dailyChallengeCompleted: {
        type: Boolean,
        default: false,
      },
      dailyChallengeDate: {
        type: Date,
        default: null,
      },
    },
    inventory: {
      borders: {
        type: [String],
        default: ['default'],
      },
      themes: {
        type: [String],
        default: ['default'],
      },
      cardBacks: {
        type: [String],
        default: ['default'],
      },
      activeBorder: {
        type: String,
        default: 'default',
      },
      activeTheme: {
        type: String,
        default: 'default',
      },
      activeCardBack: {
        type: String,
        default: 'default',
      },
    },
    preferences: {
      historicalPeriodPreferences: [String],
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium',
      },
      theme: {
        type: String,
        default: 'default',
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The email to check
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password - The password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * Update user stats after a game
 * @param {number} score - The score earned in the game
 * @param {boolean} isWin - Whether the game was won
 * @param {number} gameTime - The time taken to complete the game in seconds
 */
userSchema.methods.updateStats = async function (score, isWin, gameTime) {
  const user = this;

  // Increment games played
  user.stats.gamesPlayed += 1;

  // Update games won if applicable
  if (isWin) {
    user.stats.gamesWon += 1;
  }

  // Update high score if applicable
  if (score > user.stats.highScore) {
    user.stats.highScore = score;
  }

  // Update total score
  user.stats.totalScore += score;

  // Calculate new average score
  user.stats.averageScore = user.stats.totalScore / user.stats.gamesPlayed;

  // Update fastest game time if applicable and it's a win
  if (isWin && (user.stats.fastestGameTime === 0 || gameTime < user.stats.fastestGameTime)) {
    user.stats.fastestGameTime = gameTime;
  }

  // Award coins based on performance
  const baseCoins = isWin ? 10 : 5;
  const scoreBonus = Math.floor(score / 100);
  user.rewards.coins += baseCoins + scoreBonus;

  await user.save();
};

/**
 * Check and update user daily streak
 * @returns {Object} - Updated streak information
 */
userSchema.methods.checkDailyStreak = async function () {
  const user = this;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastLogin = user.rewards.lastLoginDate ? new Date(user.rewards.lastLoginDate) : null;

  // Initialize response object
  const result = {
    streakUpdated: false,
    newStreak: user.rewards.streakDays,
    canClaimDaily: false,
    coinsAwarded: 0,
  };

  // Update last login date to today
  user.rewards.lastLoginDate = now;

  // If no previous login or first time, start streak at 1
  if (!lastLogin) {
    user.rewards.streakDays = 1;
    result.streakUpdated = true;
    result.newStreak = 1;
    result.canClaimDaily = true;
  } else {
    // Convert dates to date-only (no time) for comparison
    const lastLoginDate = new Date(
      lastLogin.getFullYear(),
      lastLogin.getMonth(),
      lastLogin.getDate()
    );
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // If last login was yesterday, increment streak
    if (lastLoginDate.getTime() === yesterday.getTime()) {
      user.rewards.streakDays += 1;
      result.streakUpdated = true;
      result.newStreak = user.rewards.streakDays;
      result.canClaimDaily = true;
    }
    // If last login was today, no streak change but check if daily reward can be claimed
    else if (lastLoginDate.getTime() === today.getTime()) {
      const lastReward = user.rewards.lastDailyReward
        ? new Date(user.rewards.lastDailyReward)
        : null;
      if (
        !lastReward ||
        new Date(lastReward.getFullYear(), lastReward.getMonth(), lastReward.getDate()).getTime() <
          today.getTime()
      ) {
        result.canClaimDaily = true;
      }
    }
    // If last login was before yesterday, reset streak
    else if (lastLoginDate.getTime() < yesterday.getTime()) {
      user.rewards.streakDays = 1;
      result.streakUpdated = true;
      result.newStreak = 1;
      result.canClaimDaily = true;
    }
  }

  await user.save();
  return result;
};

/**
 * Claim daily reward for user
 * @returns {Object} - Reward information
 */
userSchema.methods.claimDailyReward = async function () {
  const user = this;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastReward = user.rewards.lastDailyReward ? new Date(user.rewards.lastDailyReward) : null;

  // Check if daily reward can be claimed
  if (lastReward) {
    const lastRewardDate = new Date(
      lastReward.getFullYear(),
      lastReward.getMonth(),
      lastReward.getDate()
    );
    // If already claimed today, return error
    if (lastRewardDate.getTime() === today.getTime()) {
      return {
        success: false,
        message: 'Daily reward already claimed today',
        coinsAwarded: 0,
      };
    }
  }

  // Calculate reward based on streak
  const baseReward = 10;
  const streakBonus = Math.min(user.rewards.streakDays * 2, 50); // Cap at 50 bonus coins
  const totalCoins = baseReward + streakBonus;

  // Award coins and update last reward date
  user.rewards.coins += totalCoins;
  user.rewards.lastDailyReward = now;

  await user.save();

  return {
    success: true,
    message: 'Daily reward claimed successfully',
    coinsAwarded: totalCoins,
    totalCoins: user.rewards.coins,
    streakDays: user.rewards.streakDays,
  };
};

/**
 * Purchase an item for the user
 * @param {string} itemType - Type of item (border, theme, cardBack)
 * @param {string} itemId - ID of the item to purchase
 * @param {number} cost - Cost in coins
 * @returns {Object} - Purchase information
 */
userSchema.methods.purchaseItem = async function (itemType, itemId, cost) {
  const user = this;

  // Check if user has enough coins
  if (user.rewards.coins < cost) {
    return {
      success: false,
      message: 'Not enough coins',
    };
  }

  // Check if item type is valid
  const validTypes = ['borders', 'themes', 'cardBacks'];
  if (!validTypes.includes(itemType)) {
    return {
      success: false,
      message: 'Invalid item type',
    };
  }

  // Check if user already has this item
  if (user.inventory[itemType].includes(itemId)) {
    return {
      success: false,
      message: 'Item already owned',
    };
  }

  // Purchase the item
  user.rewards.coins -= cost;
  user.inventory[itemType].push(itemId);

  await user.save();

  return {
    success: true,
    message: 'Item purchased successfully',
    remainingCoins: user.rewards.coins,
    inventory: user.inventory,
  };
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
