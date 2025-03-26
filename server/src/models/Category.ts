import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure category names are unique per user and type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema); 