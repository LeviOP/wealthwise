import { ITransaction } from '../models/Transaction';
import { IContext } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

interface TransactionInput {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
}

function assertAuthenticated(context: IContext): asserts context is IContext & { user: IUser } {
  if (!context.user) {
    throw new Error('Not authenticated');
  }
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
      assertAuthenticated(context);
      return Transaction.find({ user: context.user._id })
        .populate('category')
        .sort({ date: -1 });
    },

    transaction: async (_: unknown, { id }: { id: string }, context: IContext) => {
      assertAuthenticated(context);
      return Transaction.findOne({ _id: id, user: context.user._id })
        .populate('category');
    },

    transactionsByCategory: async (_: unknown, { categoryId }: { categoryId: string }, context: IContext) => {
      assertAuthenticated(context);
      return Transaction.find({ user: context.user._id, category: categoryId })
        .populate('category')
        .sort({ date: -1 });
    },

    transactionsByDateRange: async (
      _: unknown,
      { startDate, endDate }: { startDate: string; endDate: string },
      context: IContext
    ) => {
      assertAuthenticated(context);
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
      assertAuthenticated(context);
      const transaction = new Transaction({
        ...input,
        category: new Types.ObjectId(input.categoryId),
        user: context.user._id,
        date: new Date(input.date),
      });
      return transaction.save().then(savedTransaction => 
        Transaction.findById(savedTransaction._id).populate('category')
      );
    },

    updateTransaction: async (_: unknown, { id, input }: { id: string; input: TransactionInput }, context: IContext) => {
      assertAuthenticated(context);
      return Transaction.findOneAndUpdate(
        { _id: id, user: context.user._id },
        {
          ...input,
          category: input.categoryId ? new Types.ObjectId(input.categoryId) : undefined,
          date: new Date(input.date),
        },
        { new: true }
      ).populate('category');
    },

    deleteTransaction: async (_: unknown, { id }: { id: string }, context: IContext) => {
      assertAuthenticated(context);
      return Transaction.findOneAndDelete({ _id: id, user: context.user._id });
    },
  },
}; 