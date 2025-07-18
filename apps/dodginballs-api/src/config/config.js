const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3006),
    BYPASS_AUTH: Joi.boolean().default(false).description('Bypass authentication for testing'),
    MONGODB_URL: Joi.string().description('MongoDB connection URL'),
    MONGODB_URI: Joi.string().description('MongoDB connection URI (alternative to MONGODB_URL)'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
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
    CLIENT_URL: Joi.string().description('Client application URL'),
    GOOGLE_CLIENT_ID: Joi.string().description('Google OAuth client ID'),
    GOOGLE_CLIENT_SECRET: Joi.string().description('Google OAuth client secret'),
    FACEBOOK_APP_ID: Joi.string().description('Facebook OAuth App ID'),
    FACEBOOK_APP_SECRET: Joi.string().description('Facebook OAuth App Secret'),
    APPLE_CLIENT_ID: Joi.string().description('Apple OAuth client ID'),
    APPLE_TEAM_ID: Joi.string().description('Apple Developer Team ID'),
    APPLE_KEY_ID: Joi.string().description('Apple Key ID'),
    APPLE_PRIVATE_KEY: Joi.string().description('Apple Private Key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Prioritize MONGODB_URI if provided (for AWS ECS compatibility)
const mongoDbConnectionString = envVars.MONGODB_URI || envVars.MONGODB_URL;

if (!mongoDbConnectionString) {
  throw new Error('Config validation error: Either MONGODB_URL or MONGODB_URI must be provided');
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  clientUrl: envVars.CLIENT_URL,
  bypassAuth: envVars.BYPASS_AUTH === 'true' || envVars.BYPASS_AUTH === true,
  mongoose: {
    url: mongoDbConnectionString + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
    from: envVars.EMAIL_FROM,
  },
  oauth: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: envVars.FACEBOOK_APP_ID,
      appSecret: envVars.FACEBOOK_APP_SECRET,
    },
    apple: {
      clientId: envVars.APPLE_CLIENT_ID,
      teamId: envVars.APPLE_TEAM_ID,
      keyId: envVars.APPLE_KEY_ID,
      privateKey: envVars.APPLE_PRIVATE_KEY,
    },
  },
};
