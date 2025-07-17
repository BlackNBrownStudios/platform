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
};

export = config;