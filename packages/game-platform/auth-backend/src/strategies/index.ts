import passport from 'passport';
import { AuthConfig } from '../types/config';
import { createJwtStrategy } from './jwt.strategy';
import { createLocalStrategy } from './local.strategy';
import { createGoogleStrategy } from './google.strategy';

export { GoogleProfile } from './google.strategy';

export const initializePassport = (config: AuthConfig) => {
  // JWT strategy (always required)
  passport.use('jwt', createJwtStrategy(config));
  
  // Local strategy (email/password)
  passport.use('local', createLocalStrategy());
  
  // OAuth strategies (optional)
  if (config.oauth?.google) {
    passport.use('google', createGoogleStrategy(config));
  }
  
  // Note: Facebook and Apple strategies can be added similarly
  // when their respective strategy files are created
  
  return passport;
};