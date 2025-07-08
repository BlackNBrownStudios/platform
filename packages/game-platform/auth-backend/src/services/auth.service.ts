import httpStatus from 'http-status';
import { ApiError } from '@platform/backend-core';
import { User, IUser } from '../models/user.model';
import { Token, TokenTypes } from '../models/token.model';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { AuthConfig } from '../types/config';
import { AuthTokens } from '../types/auth';

export class AuthService {
  private tokenService: TokenService;
  private userService: UserService;

  constructor(config: AuthConfig) {
    this.tokenService = new TokenService(config);
    this.userService = new UserService();
  }

  /**
   * Login with username/email and password
   */
  async loginUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<IUser> {
    const user = await this.userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    
    if (!user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled');
    }
    
    // Update login stats
    await User.findByIdAndUpdate(user.id, {
      'stats.lastLogin': new Date(),
      $inc: { 'stats.loginCount': 1 },
    });
    
    return user;
  }

  /**
   * Login with OAuth
   */
  async loginWithOAuth(
    provider: 'google' | 'facebook' | 'apple',
    profile: any
  ): Promise<IUser> {
    let user = await User.findOne({
      [`oauth.${provider}.id`]: profile.id,
    });

    if (!user && profile.email) {
      // Check if user exists with this email
      user = await User.findOne({ email: profile.email });
      
      if (user) {
        // Link OAuth to existing user
        user.oauth = user.oauth || {};
        user.oauth[provider] = {
          id: profile.id,
          email: profile.email,
        };
        await user.save();
      }
    }

    if (!user) {
      // Create new user
      user = await User.create({
        email: profile.email || `${profile.id}@${provider}.local`,
        name: profile.displayName || profile.name || 'User',
        isEmailVerified: true, // OAuth emails are pre-verified
        oauth: {
          [provider]: {
            id: profile.id,
            email: profile.email,
          },
        },
      });
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled');
    }

    // Update login stats
    await User.findByIdAndUpdate(user.id, {
      'stats.lastLogin': new Date(),
      $inc: { 'stats.loginCount': 1 },
    });

    return user;
  }

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<void> {
    const refreshTokenDoc = await Token.findOne({
      token: refreshToken,
      type: TokenTypes.REFRESH,
      blacklisted: false,
    });
    
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    
    await refreshTokenDoc.deleteOne();
  }

  /**
   * Refresh auth tokens
   */
  async refreshAuth(refreshToken: string): Promise<AuthTokens> {
    try {
      const refreshTokenDoc = await this.tokenService.verifyToken(
        refreshToken,
        TokenTypes.REFRESH
      );
      
      const user = await this.userService.getUserById(
        refreshTokenDoc.user.toString()
      );
      
      if (!user) {
        throw new Error();
      }
      
      await refreshTokenDoc.deleteOne();
      return this.tokenService.generateAuthTokens(user);
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    resetPasswordToken: string,
    newPassword: string
  ): Promise<void> {
    try {
      const resetPasswordTokenDoc = await this.tokenService.verifyToken(
        resetPasswordToken,
        TokenTypes.RESET_PASSWORD
      );
      
      const user = await this.userService.getUserById(
        resetPasswordTokenDoc.user.toString()
      );
      
      if (!user) {
        throw new Error();
      }
      
      await this.userService.updateUserById(user.id, { password: newPassword });
      await Token.deleteMany({
        user: user.id,
        type: TokenTypes.RESET_PASSWORD,
      });
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(verifyEmailToken: string): Promise<void> {
    try {
      const verifyEmailTokenDoc = await this.tokenService.verifyToken(
        verifyEmailToken,
        TokenTypes.VERIFY_EMAIL
      );
      
      const user = await this.userService.getUserById(
        verifyEmailTokenDoc.user.toString()
      );
      
      if (!user) {
        throw new Error();
      }
      
      await Token.deleteMany({
        user: user.id,
        type: TokenTypes.VERIFY_EMAIL,
      });
      
      await this.userService.updateUserById(user.id, {
        isEmailVerified: true,
      });
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }

  /**
   * Generate auth tokens for user
   */
  async generateAuthTokens(user: IUser): Promise<AuthTokens> {
    return this.tokenService.generateAuthTokens(user);
  }
}