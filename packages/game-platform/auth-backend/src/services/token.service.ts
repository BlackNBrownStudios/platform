import jwt from 'jsonwebtoken';
import moment from 'moment';
import mongoose from 'mongoose';
import { Token, TokenTypes, IToken } from '../models/token.model';
import { IUser } from '../models/user.model';
import { AuthConfig } from '../types/config';
import { AuthTokens } from '../types/auth';

export class TokenService {
  constructor(private config: AuthConfig) {}

  /**
   * Generate JWT token
   */
  generateToken(
    userId: string,
    expires: moment.Moment,
    type: TokenTypes,
    secret: string
  ): string {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }

  /**
   * Save a token
   */
  async saveToken(
    token: string,
    userId: string,
    expires: moment.Moment,
    type: TokenTypes,
    blacklisted = false
  ): Promise<IToken> {
    const tokenDoc = await Token.create({
      token,
      user: userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
    return tokenDoc;
  }

  /**
   * Verify token and return token doc (or throw an error if it is not valid)
   */
  async verifyToken(token: string, type: TokenTypes): Promise<IToken> {
    const payload = jwt.verify(
      token,
      type === TokenTypes.REFRESH
        ? this.config.jwt.refreshSecret
        : this.config.jwt.secret
    ) as any;
    
    const tokenDoc = await Token.findOne({
      token,
      type,
      user: payload.sub,
      blacklisted: false,
    });
    
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    
    return tokenDoc;
  }

  /**
   * Generate auth tokens
   */
  async generateAuthTokens(user: IUser): Promise<AuthTokens> {
    const accessTokenExpires = moment().add(
      this.config.jwt.accessExpirationMinutes,
      'minutes'
    );
    const accessToken = this.generateToken(
      user.id,
      accessTokenExpires,
      TokenTypes.REFRESH, // Access tokens also use REFRESH type for JWT validation
      this.config.jwt.secret
    );

    const refreshTokenExpires = moment().add(
      this.config.jwt.refreshExpirationDays,
      'days'
    );
    const refreshToken = this.generateToken(
      user.id,
      refreshTokenExpires,
      TokenTypes.REFRESH,
      this.config.jwt.refreshSecret
    );
    
    await this.saveToken(
      refreshToken,
      user.id,
      refreshTokenExpires,
      TokenTypes.REFRESH
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }

  /**
   * Generate reset password token
   */
  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await mongoose.model('User').findOne({ email });
    if (!user) {
      throw new Error('No users found with this email');
    }
    
    const expires = moment().add(
      this.config.jwt.resetPasswordExpirationMinutes,
      'minutes'
    );
    const resetPasswordToken = this.generateToken(
      user.id,
      expires,
      TokenTypes.RESET_PASSWORD,
      this.config.jwt.secret
    );
    
    await this.saveToken(
      resetPasswordToken,
      user.id,
      expires,
      TokenTypes.RESET_PASSWORD
    );
    
    return resetPasswordToken;
  }

  /**
   * Generate verify email token
   */
  async generateVerifyEmailToken(user: IUser): Promise<string> {
    const expires = moment().add(
      this.config.jwt.verifyEmailExpirationMinutes,
      'minutes'
    );
    const verifyEmailToken = this.generateToken(
      user.id,
      expires,
      TokenTypes.VERIFY_EMAIL,
      this.config.jwt.secret
    );
    
    await this.saveToken(
      verifyEmailToken,
      user.id,
      expires,
      TokenTypes.VERIFY_EMAIL
    );
    
    return verifyEmailToken;
  }

  /**
   * Delete tokens
   */
  async deleteTokens(
    userId: string,
    type?: TokenTypes
  ): Promise<void> {
    const filter: any = { user: userId };
    if (type) {
      filter.type = type;
    }
    await Token.deleteMany(filter);
  }

  /**
   * Blacklist token
   */
  async blacklistToken(token: string): Promise<void> {
    await Token.updateOne({ token }, { blacklisted: true });
  }
}