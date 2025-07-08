import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models/user.model';

export const createLocalStrategy = () => {
  return new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.isPasswordMatch(password))) {
          return done(null, false, { message: 'Incorrect email or password' });
        }
        
        if (!user.isActive) {
          return done(null, false, { message: 'Account is disabled' });
        }
        
        // Remove password before returning
        user.password = undefined;
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  );
};