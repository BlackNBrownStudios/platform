const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

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
      required: function() {
        // Password not required if the user is registering via OAuth
        return !this.oauth || !this.oauth.provider;
      },
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
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
    profilePicture: {
      type: String,
      default: '',
    },
    statistics: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      highScore: { type: Number, default: 0 },
      throws: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      hits: { type: Number, default: 0 },
      dodges: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    },
    oauth: {
      provider: { type: String, enum: ['google', 'facebook', 'apple', null], default: null },
      id: { type: String, default: null },
      data: { type: mongoose.Schema.Types.Mixed, default: null }
    }
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Find or create a user from OAuth profile
 * @param {string} provider - The OAuth provider (google, facebook, apple)
 * @param {Object} profile - The profile returned from the OAuth provider
 * @returns {Promise<User>} - The user
 */
userSchema.statics.findOrCreateFromOAuth = async function (provider, profile) {
  const User = this;
  let email = '';
  let name = '';
  let profilePicture = '';
  let oauthId = '';

  // Extract data based on provider
  switch (provider) {
    case 'google':
      email = profile.emails[0].value;
      name = profile.displayName || profile.name;
      profilePicture = profile.photos?.[0]?.value || '';
      oauthId = profile.id;
      break;
    case 'facebook':
      email = profile.emails?.[0]?.value || '';
      name = profile.displayName || profile.name;
      profilePicture = profile.photos?.[0]?.value || '';
      oauthId = profile.id;
      break;
    case 'apple':
      // Apple profile structure is different
      email = profile.email || '';
      name = profile.name?.firstName ? `${profile.name.firstName} ${profile.name.lastName || ''}` : 'Apple User';
      oauthId = profile.sub || profile.id;
      break;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Find existing user by OAuth ID
  let user = await User.findOne({ 'oauth.provider': provider, 'oauth.id': oauthId });
  
  // If not found by OAuth ID, try to find by email
  if (!user && email) {
    user = await User.findOne({ email });
  }
  
  // If user exists, update OAuth data
  if (user) {
    // Update OAuth data if not already set
    if (!user.oauth.provider) {
      user.oauth = {
        provider,
        id: oauthId,
        data: profile
      };
    }
    
    // Update profile picture if one is provided and user doesn't have one
    if (profilePicture && !user.profilePicture) {
      user.profilePicture = profilePicture;
    }
    
    // Save the updated user
    await user.save();
    return user;
  }
  
  // Create new user if none exists
  const newUser = await User.create({
    email,
    name,
    profilePicture,
    isEmailVerified: true, // Auto-verify email for OAuth users
    oauth: {
      provider,
      id: oauthId,
      data: profile
    }
  });
  
  return newUser;
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
