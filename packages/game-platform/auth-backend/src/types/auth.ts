import { Request } from 'express';
import { IUser } from '../models/user.model';

export interface AuthTokens {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export type AuthRequest = Request & {
  user?: IUser;
};