import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '@platform/backend-core';

export interface ILeaderboardEntry extends Document {
  leaderboardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  rank?: number;
  metadata?: Record<string, any>;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    leaderboardId: {
      type: Schema.Types.ObjectId,
      ref: 'Leaderboard',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
leaderboardEntrySchema.plugin(toJSON);
leaderboardEntrySchema.plugin(paginate);

// Indexes
leaderboardEntrySchema.index({ leaderboardId: 1, score: -1 });
leaderboardEntrySchema.index({ leaderboardId: 1, userId: 1 }, { unique: true });
leaderboardEntrySchema.index({ userId: 1, achievedAt: -1 });

// Pre-save hook to update rank
leaderboardEntrySchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('score')) {
    // Rank will be calculated by the service
    this.rank = undefined;
  }
  next();
});

export interface ILeaderboardEntryModel extends Model<ILeaderboardEntry> {
  paginate: any;
}

const LeaderboardEntry: ILeaderboardEntryModel = mongoose.model<ILeaderboardEntry, ILeaderboardEntryModel>(
  'LeaderboardEntry',
  leaderboardEntrySchema
);

export default LeaderboardEntry;