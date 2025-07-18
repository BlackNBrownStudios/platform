import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '@platform/backend-core';

export interface ILeaderboard extends Document {
  gameId: string;
  name: string;
  description?: string;
  type: 'global' | 'daily' | 'weekly' | 'monthly' | 'alltime';
  scoreType: 'highest' | 'lowest' | 'cumulative';
  resetSchedule?: string; // cron expression for periodic resets
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['global', 'daily', 'weekly', 'monthly', 'alltime'],
      default: 'global',
    },
    scoreType: {
      type: String,
      required: true,
      enum: ['highest', 'lowest', 'cumulative'],
      default: 'highest',
    },
    resetSchedule: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
leaderboardSchema.plugin(toJSON);
leaderboardSchema.plugin(paginate);

// Indexes
leaderboardSchema.index({ gameId: 1, type: 1 });
leaderboardSchema.index({ gameId: 1, name: 1 }, { unique: true });

export interface ILeaderboardModel extends Model<ILeaderboard> {
  paginate: any;
}

const Leaderboard: ILeaderboardModel = mongoose.model<ILeaderboard, ILeaderboardModel>('Leaderboard', leaderboardSchema);

export default Leaderboard;