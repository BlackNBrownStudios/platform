import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from '@platform/backend-core';

export interface IUser extends Document {
  email: string;
  username?: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  gameSpecificData?: Record<string, any>;
  oauth?: {
    google?: { id: string; email?: string };
    facebook?: { id: string; email?: string };
    apple?: { id: string; email?: string };
  };
  preferences?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
  };
  stats?: {
    lastLogin?: Date;
    loginCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatch(password: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
  isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean>;
  paginate(filter: any, options: any): Promise<any>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      private: true, // Will be removed by toJSON plugin
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gameSpecificData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    oauth: {
      google: {
        id: String,
        email: String,
      },
      facebook: {
        id: String,
        email: String,
      },
      apple: {
        id: String,
        email: String,
      },
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    stats: {
      lastLogin: Date,
      loginCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'oauth.google.id': 1 });
userSchema.index({ 'oauth.facebook.id': 1 });
userSchema.index({ 'oauth.apple.id': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Instance methods
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  const user = this;
  return user.password ? bcrypt.compare(password, user.password) : false;
};

// Static methods
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isUsernameTaken = async function (
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);