import { ITransaction } from '../models/Transaction';
import { IContext } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

interface TransactionInput {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export const transactionResolvers = {
  Transaction: {
    id: (parent: ITransaction) => (parent._id as Types.ObjectId).toString(),
    category: (parent: ITransaction) => parent.category,
    date: (parent: ITransaction) => parent.date.toISOString(),
    createdAt: (parent: ITransaction) => parent.createdAt.toISOString(),
    updatedAt: (parent: ITransaction) => parent.updatedAt.toISOString(),
  },

  Query: {
    transactions: async (_: unknown, __: unknown, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.find({ user: context.user._id }).sort({ date: -1 });
    },

    transaction: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.findOne({ _id: id, user: context.user._id });
    },

    transactionsByCategory: async (_: unknown, { categoryId }: { categoryId: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.find({ user: context.user._id, category: categoryId }).sort({ date: -1 });
    },

    transactionsByDateRange: async (
      _: unknown,
      { startDate, endDate }: { startDate: string; endDate: string },
      context: IContext
    ) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.find({
        user: context.user._id,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).populate('category').sort({ date: -1 });
    },
  },

  Mutation: {
    createTransaction: async (_: unknown, { input }: { input: TransactionInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      const transaction = new Transaction({
        ...input,
        user: context.user._id,
        date: new Date(input.date),
      });
      return transaction.save();
    },

    updateTransaction: async (_: unknown, { id, input }: { id: string; input: TransactionInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.findOneAndUpdate(
        { _id: id, user: context.user._id },
        {
          ...input,
          date: new Date(input.date),
        },
        { new: true }
      );
    },

    deleteTransaction: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.findOneAndDelete({ _id: id, user: context.user._id });
    },
  },
}; 