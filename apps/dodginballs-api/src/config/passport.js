const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const logger = require('./logger');
const User = require('../models/user.model');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

// Google OAuth Strategy
let googleStrategy = null;
if (config.oauth?.google?.clientId && config.oauth?.google?.clientSecret) {
  googleStrategy = new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: `${config.clientUrl}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user or create a new one based on Google profile
        const user = await User.findOrCreateFromOAuth('google', profile);
        return done(null, user);
      } catch (error) {
        logger.error('Google authentication error:', error);
        return done(error);
      }
    }
  );
} else {
  logger.info('Google OAuth is not configured');
}

// Facebook OAuth Strategy
let facebookStrategy = null;
if (config.oauth?.facebook?.appId && config.oauth?.facebook?.appSecret) {
  facebookStrategy = new FacebookStrategy(
    {
      clientID: config.oauth.facebook.appId,
      clientSecret: config.oauth.facebook.appSecret,
      callbackURL: `${config.clientUrl}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user or create a new one based on Facebook profile
        const user = await User.findOrCreateFromOAuth('facebook', profile);
        return done(null, user);
      } catch (error) {
        logger.error('Facebook authentication error:', error);
        return done(error);
      }
    }
  );
} else {
  logger.info('Facebook OAuth is not configured');
}

// Apple OAuth Strategy
let appleStrategy = null;
if (
  config.oauth?.apple?.clientId && 
  config.oauth?.apple?.teamId && 
  config.oauth?.apple?.keyId && 
  config.oauth?.apple?.privateKey
) {
  appleStrategy = new AppleStrategy(
    {
      clientID: config.oauth.apple.clientId,
      teamID: config.oauth.apple.teamId,
      keyID: config.oauth.apple.keyId,
      privateKeyString: config.oauth.apple.privateKey,
      callbackURL: `${config.clientUrl}/api/v1/auth/apple/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Find existing user or create a new one based on Apple profile
        const user = await User.findOrCreateFromOAuth('apple', profile);
        return done(null, user);
      } catch (error) {
        logger.error('Apple authentication error:', error);
        return done(error);
      }
    }
  );
} else {
  logger.info('Apple OAuth is not configured');
}

module.exports = {
  jwtStrategy,
  googleStrategy,
  facebookStrategy,
  appleStrategy,
};
