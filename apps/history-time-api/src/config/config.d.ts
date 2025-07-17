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
  clientUrl?: string;
  google: {
    apiKey?: string;
    searchEngineId?: string;
    oauth: {
      clientId?: string;
      clientSecret?: string;
      callbackUrl?: string;
    };
  };
  facebook: {
    appId?: string;
    appSecret?: string;
    callbackUrl?: string;
  };
  apple: {
    clientId?: string;
    teamId?: string;
    keyId?: string;
    privateKey?: string;
    callbackUrl?: string;
  };
  unsplash?: {
    apiKey?: string;
  };
};

export = config;