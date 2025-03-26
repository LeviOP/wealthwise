import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, period: 1 });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema); 