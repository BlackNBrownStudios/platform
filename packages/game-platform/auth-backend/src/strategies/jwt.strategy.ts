import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { TokenTypes } from '../models/token.model';
import { User } from '../models/user.model';
import { AuthConfig } from '../types/config';

export const createJwtStrategy = (config: AuthConfig) => {
  const options: StrategyOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  return new JwtStrategy(options, async (payload, done) => {
    try {
      if (payload.type !== TokenTypes.REFRESH) {
        throw new Error('Invalid token type');
      }
      
      const user = await User.findById(payload.sub).select('-password');
      
      if (!user) {
        return done(null, false);
      }
      
      if (!user.isActive) {
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};