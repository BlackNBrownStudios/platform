import nodemailer from 'nodemailer';
import { AuthConfig } from '../types/config';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    if (!config.email) {
      throw new Error('Email configuration is required');
    }
    
    this.config = config;
    this.transporter = nodemailer.createTransport(config.email.smtp);
    
    // Verify connection configuration
    this.transporter.verify().catch((err) => {
      console.error('Email service error:', err);
    });
  }

  /**
   * Send an email
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const msg = {
      from: this.config.email!.from,
      to,
      subject,
      html,
    };
    
    await this.transporter.sendMail(msg);
  }

  /**
   * Send reset password email
   */
  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const subject = 'Reset password';
    const resetPasswordUrl = `${this.config.frontendUrl || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Password</h2>
        <p>Dear user,</p>
        <p>To reset your password, click on this link:</p>
        <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request any password resets, then ignore this email.</p>
        <p><small>This link will expire in ${this.config.jwt.resetPasswordExpirationMinutes} minutes.</small></p>
      </div>
    `;
    
    await this.sendEmail(to, subject, html);
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const subject = 'Email Verification';
    const verificationEmailUrl = `${this.config.frontendUrl || 'http://localhost:3000'}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Dear user,</p>
        <p>To verify your email, click on this link:</p>
        <a href="${verificationEmailUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you did not create an account, then ignore this email.</p>
        <p><small>This link will expire in ${this.config.jwt.verifyEmailExpirationMinutes} minutes.</small></p>
      </div>
    `;
    
    await this.sendEmail(to, subject, html);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to the Game Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${name}!</h2>
        <p>Thank you for joining our game platform.</p>
        <p>You can now access all our games and features.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy gaming!</p>
      </div>
    `;
    
    await this.sendEmail(to, subject, html);
  }
}