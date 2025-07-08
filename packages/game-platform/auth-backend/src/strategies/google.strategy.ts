import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { AuthConfig } from '../types/config';

export interface GoogleProfile {
  id: string;
  email?: string;
  displayName?: string;
  name?: string;
  picture?: string;
}

export const createGoogleStrategy = (config: AuthConfig) => {
  if (!config.oauth?.google) {
    throw new Error('Google OAuth configuration is missing');
  }

  return new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackURL,
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const googleProfile: GoogleProfile = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          displayName: profile.displayName,
          name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
          picture: profile.photos?.[0]?.value,
        };
        
        return done(null, googleProfile);
      } catch (error) {
        return done(error as Error);
      }
    }
  );
};