import mongoose, { Schema, Document } from 'mongoose';
import { toJSON } from '@platform/backend-core';

export enum TokenTypes {
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export interface IToken extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  type: TokenTypes;
  expires: Date;
  blacklisted: boolean;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenTypes),
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin
tokenSchema.plugin(toJSON);

// Compound index for faster queries
tokenSchema.index({ token: 1, type: 1 });
tokenSchema.index({ user: 1, type: 1 });

export const Token = mongoose.model<IToken>('Token', tokenSchema);