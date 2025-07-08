import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '@platform/backend-core';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';
import { AuthConfig } from '../types/config';
import { AuthRequest } from '../types/auth';
import { GoogleProfile } from '../strategies';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private tokenService: TokenService;
  private emailService?: EmailService;

  constructor(config: AuthConfig) {
    this.authService = new AuthService(config);
    this.userService = new UserService();
    this.tokenService = new TokenService(config);
    
    if (config.email) {
      this.emailService = new EmailService(config);
    }
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    const tokens = await this.tokenService.generateAuthTokens(user);
    
    // Send verification email if email service is configured
    if (this.emailService && !user.isEmailVerified) {
      const verifyEmailToken = await this.tokenService.generateVerifyEmailToken(user);
      await this.emailService.sendVerificationEmail(user.email, verifyEmailToken);
    }
    
    res.status(httpStatus.CREATED).send({ user, tokens });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await this.tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    await this.authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  });

  refreshTokens = catchAsync(async (req: Request, res: Response) => {
    const tokens = await this.authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    if (!this.emailService) {
      res.status(httpStatus.SERVICE_UNAVAILABLE).send({
        message: 'Email service not configured',
      });
      return;
    }
    
    const resetPasswordToken = await this.tokenService.generateResetPasswordToken(
      req.body.email
    );
    await this.emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.NO_CONTENT).send();
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    await this.authService.resetPassword(req.query.token as string, req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
  });

  sendVerificationEmail = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!this.emailService) {
      res.status(httpStatus.SERVICE_UNAVAILABLE).send({
        message: 'Email service not configured',
      });
      return;
    }
    
    const verifyEmailToken = await this.tokenService.generateVerifyEmailToken(req.user!);
    await this.emailService.sendVerificationEmail(req.user!.email, verifyEmailToken);
    res.status(httpStatus.NO_CONTENT).send();
  });

  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    await this.authService.verifyEmail(req.query.token as string);
    res.status(httpStatus.NO_CONTENT).send();
  });

  changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = await this.authService.loginUserWithEmailAndPassword(
      req.user!.email,
      oldPassword
    );
    await this.userService.updateUserById(user.id, { password: newPassword });
    res.status(httpStatus.NO_CONTENT).send();
  });

  // OAuth callbacks
  googleCallback = catchAsync(async (req: Request, res: Response) => {
    const profile = req.user as GoogleProfile;
    const user = await this.authService.loginWithOAuth('google', profile);
    const tokens = await this.tokenService.generateAuthTokens(user);
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
    redirectUrl.pathname = '/auth/callback';
    redirectUrl.searchParams.append('accessToken', tokens.access.token);
    redirectUrl.searchParams.append('refreshToken', tokens.refresh.token);
    
    res.redirect(redirectUrl.toString());
  });
}