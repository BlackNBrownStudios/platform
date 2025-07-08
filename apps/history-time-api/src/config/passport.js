const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple');

const { User } = require('../models');

const config = require('./config');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
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
const googleStrategy =
  config.google.oauth.clientId && config.google.oauth.clientSecret
    ? new GoogleStrategy(
        {
          clientID: config.google.oauth.clientId,
          clientSecret: config.google.oauth.clientSecret,
          callbackURL: `${config.clientUrl}${config.google.oauth.callbackUrl}`,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ 'oauth.google.id': profile.id });

            if (!user) {
              // Check if user exists with the same email
              const email = profile.emails[0].value;
              user = await User.findOne({ email });

              if (user) {
                // Link Google profile to existing user
                user.oauth.google = {
                  id: profile.id,
                  token: accessToken,
                  profile: profile._json,
                };
                user.authType = 'google';
                await user.save();
              } else {
                // Create new user with Google profile
                user = await User.create({
                  name: profile.displayName,
                  email: email,
                  authType: 'google',
                  isEmailVerified: true, // Email is verified by Google
                  oauth: {
                    google: {
                      id: profile.id,
                      token: accessToken,
                      profile: profile._json,
                    },
                  },
                });
              }
            } else {
              // Update token if user already exists
              user.oauth.google.token = accessToken;
              user.oauth.google.profile = profile._json;
              await user.save();
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    : null;

// Facebook OAuth Strategy
const facebookStrategy =
  config.facebook.appId && config.facebook.appSecret
    ? new FacebookStrategy(
        {
          clientID: config.facebook.appId,
          clientSecret: config.facebook.appSecret,
          callbackURL: `${config.clientUrl}${config.facebook.callbackUrl}`,
          profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Facebook ID
            let user = await User.findOne({ 'oauth.facebook.id': profile.id });

            if (!user) {
              // Check if user exists with the same email (if email is available)
              let email =
                profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
              if (email) {
                user = await User.findOne({ email });
              }

              if (user) {
                // Link Facebook profile to existing user
                user.oauth.facebook = {
                  id: profile.id,
                  token: accessToken,
                  profile: profile._json,
                };
                user.authType = 'facebook';
                await user.save();
              } else {
                // Create new user with Facebook profile
                user = await User.create({
                  name: profile.displayName,
                  email: email || `fb_${profile.id}@placeholder.com`, // If no email, create placeholder
                  authType: 'facebook',
                  isEmailVerified: email ? true : false, // Email is verified by Facebook if provided
                  oauth: {
                    facebook: {
                      id: profile.id,
                      token: accessToken,
                      profile: profile._json,
                    },
                  },
                });
              }
            } else {
              // Update token if user already exists
              user.oauth.facebook.token = accessToken;
              user.oauth.facebook.profile = profile._json;
              await user.save();
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    : null;

// Apple OAuth Strategy
const appleStrategy =
  config.apple.clientId && config.apple.teamId && config.apple.keyId && config.apple.privateKey
    ? new AppleStrategy(
        {
          clientID: config.apple.clientId,
          teamID: config.apple.teamId,
          keyID: config.apple.keyId,
          privateKeyString: config.apple.privateKey,
          callbackURL: `${config.clientUrl}${config.apple.callbackUrl}`,
          scope: ['name', 'email'],
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Apple profile is different, handle accordingly
            const { id, email, name } = profile;

            // Check if user already exists with this Apple ID
            let user = await User.findOne({ 'oauth.apple.id': id });

            if (!user) {
              // Check if user exists with the same email
              if (email) {
                user = await User.findOne({ email });
              }

              if (user) {
                // Link Apple profile to existing user
                user.oauth.apple = {
                  id,
                  token: accessToken,
                  profile,
                };
                user.authType = 'apple';
                await user.save();
              } else {
                // Create new user with Apple profile
                const displayName = name
                  ? `${name.firstName} ${name.lastName}`.trim()
                  : 'Apple User';
                user = await User.create({
                  name: displayName,
                  email: email || `apple_${id}@placeholder.com`, // If no email, create placeholder
                  authType: 'apple',
                  isEmailVerified: email ? true : false, // Email is verified by Apple if provided
                  oauth: {
                    apple: {
                      id,
                      token: accessToken,
                      profile,
                    },
                  },
                });
              }
            } else {
              // Update token if user already exists
              user.oauth.apple.token = accessToken;
              if (profile) {
                user.oauth.apple.profile = profile;
              }
              await user.save();
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    : null;

module.exports = {
  jwtStrategy,
  googleStrategy,
  facebookStrategy,
  appleStrategy,
};
