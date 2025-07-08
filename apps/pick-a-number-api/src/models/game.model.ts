import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  userId: mongoose.Types.ObjectId;
  targetNumber: number;
  attempts: number[];
  isWon: boolean;
  isActive: boolean;
  startedAt: Date;
  completedAt?: Date;
  score: number;
}

const gameSchema = new Schema<IGame>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    attempts: [{
      type: Number,
      min: 1,
      max: 100,
    }],
    isWon: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate score based on number of attempts
gameSchema.pre('save', function (next) {
  if (this.isWon && !this.score) {
    // Score: 100 points minus 10 for each attempt (minimum 10 points)
    this.score = Math.max(100 - (this.attempts.length - 1) * 10, 10);
  }
  next();
});

export const Game = mongoose.model<IGame>('Game', gameSchema);