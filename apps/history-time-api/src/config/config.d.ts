import { ConnectOptions } from 'mongoose';

declare const config: {
  env: string;
  port: number;
  mongoose: {
    url: string;
    options: ConnectOptions;
  };
  jwt: {
    secret: string;
    refreshSecret?: string;
    accessExpirationMinutes: number;
    refreshExpirationDays: number;
    resetPasswordExpirationMinutes: number;
    verifyEmailExpirationMinutes: number;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
  };
  frontendUrl?: string;
  google?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  facebook?: {
    appId: string;
    appSecret: string;
    callbackURL: string;
  };
  apple?: {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKey?: string;
    callbackURL?: string;
  };
};

export = config;