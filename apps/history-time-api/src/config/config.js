const path = require('path');

const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(5001),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CLIENT_URL: Joi.string().description('Client URL for email verification and password reset'),
    GOOGLE_API_KEY: Joi.string().description('Google API Key for image search'),
    GOOGLE_CSE_ID: Joi.string().description('Google Custom Search Engine ID'),
    UNSPLASH_ACCESS_KEY: Joi.string().description('Unsplash API Access Key'),
    // OAuth Provider Settings
    GOOGLE_CLIENT_ID: Joi.string().description('Google OAuth client ID'),
    GOOGLE_CLIENT_SECRET: Joi.string().description('Google OAuth client secret'),
    FACEBOOK_APP_ID: Joi.string().description('Facebook App ID'),
    FACEBOOK_APP_SECRET: Joi.string().description('Facebook App Secret'),
    APPLE_CLIENT_ID: Joi.string().description('Apple Client ID'),
    APPLE_TEAM_ID: Joi.string().description('Apple Team ID'),
    APPLE_KEY_ID: Joi.string().description('Apple Key ID'),
    APPLE_PRIVATE_KEY: Joi.string().description('Apple Private Key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      // Use these options to prevent deprecation warnings
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM || 'no-reply@historyapp.com',
  },
  clientUrl: envVars.CLIENT_URL || 'http://localhost:3000',
  google: {
    apiKey: envVars.GOOGLE_API_KEY,
    searchEngineId: envVars.GOOGLE_CSE_ID,
    oauth: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackUrl: '/v1/auth/google/callback',
    },
  },
  facebook: {
    appId: envVars.FACEBOOK_APP_ID,
    appSecret: envVars.FACEBOOK_APP_SECRET,
    callbackUrl: '/v1/auth/facebook/callback',
  },
  apple: {
    clientId: envVars.APPLE_CLIENT_ID,
    teamId: envVars.APPLE_TEAM_ID,
    keyId: envVars.APPLE_KEY_ID,
    privateKey: envVars.APPLE_PRIVATE_KEY,
    callbackUrl: '/v1/auth/apple/callback',
  },
  unsplash: {
    apiKey: envVars.UNSPLASH_ACCESS_KEY,
  },
};
