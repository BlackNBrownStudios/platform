const nodemailer = require('nodemailer');

const config = require('../config/config');
const logger = require('../config/logger');

// Create transport or use a null transport if email settings aren't configured
let transport;
try {
  if (config.email && config.email.smtp && config.env !== 'test') {
    transport = nodemailer.createTransport(config.email.smtp);
    /* istanbul ignore next */
    transport
      .verify()
      .then(() => logger.info('Connected to email server'))
      .catch((error) =>
        logger.warn(
          'Unable to connect to email server. Make sure you have configured the SMTP options:',
          error
        )
      );
  } else if (config.email && config.email.smtp && config.env === 'test') {
    // In test environment, create transport without verification
    transport = nodemailer.createTransport(config.email.smtp);
  } else {
    logger.warn('Email configuration not found, email functionality will be disabled');
    // Create a mock transport that logs instead of sending
    transport = {
      sendMail: (msg) => {
        logger.info('Email sending skipped (not configured):', msg);
        return Promise.resolve();
      },
    };
  }
} catch (error) {
  logger.error('Error setting up email transport:', error);
  // Fallback transport
  transport = {
    sendMail: (msg) => {
      logger.info('Email sending skipped (error in setup):', msg);
      return Promise.resolve();
    },
  };
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  try {
    const msg = { from: config.email?.from || 'noreply@historyapp.com', to, subject, text };
    await transport.sendMail(msg);
  } catch (error) {
    logger.error('Error sending email:', error);
    // Don't rethrow to prevent app crashes due to email issues
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  try {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);
  } catch (error) {
    logger.error('Error sending reset password email:', error);
  }
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  try {
    const subject = 'Email Verification';
    // replace this url with the link to the email verification page of your front-end app
    const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
    const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
    await sendEmail(to, subject, text);
  } catch (error) {
    logger.error('Error sending verification email:', error);
  }
};

/**
 * Send a welcome email after successful registration
 * @param {string} to
 * @param {string} name
 * @returns {Promise}
 */
const sendWelcomeEmail = async (to, name) => {
  try {
    const subject = 'Welcome to History Time';
    const text = `Dear ${name},
  
Welcome to History Time! We're excited to have you join our community of history enthusiasts.

Get ready to test your knowledge of historical events by placing them in chronological order.

Happy gaming!

The History Time Team`;
    await sendEmail(to, subject, text);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
};

/**
 * Send a game completion summary email
 * @param {string} to
 * @param {Object} gameData
 * @returns {Promise}
 */
const sendGameSummaryEmail = async (to, gameData) => {
  try {
    const { score, correctPlacements, totalCards, timeTaken, isWin } = gameData;
    const subject = `Game Summary - ${isWin ? 'Victory!' : 'Try Again'}`;
    const text = `Dear History Time Player,

Here's a summary of your recent game:

Score: ${score}
Correct Placements: ${correctPlacements}/${totalCards} (${Math.round(
      (correctPlacements / totalCards) * 100
    )}%)
Time Taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s
Result: ${isWin ? 'Victory! Congratulations!' : "Keep trying! You'll get it next time."}

Come back and play again to improve your score and knowledge of historical events!

The History Time Team`;
    await sendEmail(to, subject, text);
  } catch (error) {
    logger.error('Error sending game summary email:', error);
  }
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendGameSummaryEmail,
};
