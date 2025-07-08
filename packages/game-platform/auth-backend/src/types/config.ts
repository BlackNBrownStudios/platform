export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  accessExpirationMinutes: number;
  refreshExpirationDays: number;
  resetPasswordExpirationMinutes: number;
  verifyEmailExpirationMinutes: number;
}

export interface OAuthConfig {
  google?: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
  facebook?: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
  apple?: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    callbackURL: string;
  };
}

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
}

export interface AuthConfig {
  jwt: JWTConfig;
  oauth?: OAuthConfig;
  email?: EmailConfig;
  bcryptRounds?: number;
  frontendUrl?: string;
}