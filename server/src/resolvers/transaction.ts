import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { IContext } from '../types/context';

export const transactionResolvers = {
  Transaction: {
    id: (parent: any) => parent._id.toString(),
    category: (parent: any) => parent.category,
    date: (parent: any) => parent.date.toISOString(),
    createdAt: (parent: any) => parent.createdAt.toISOString(),
    updatedAt: (parent: any) => parent.updatedAt.toISOString(),
  },

  Query: {
    transactions: async (_: any, __: any, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.find({ user: context.user._id })
        .populate('category')
        .sort({ date: -1 });
    },

    transaction: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.findOne({ _id: id, user: context.user._id }).populate('category');
    },

    transactionsByCategory: async (_: any, { categoryId }: { categoryId: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Transaction.find({ 
        user: context.user._id,
        category: categoryId 
      }).populate('category').sort({ date: -1 });
    },

    transactionsByDateRange: async (
      _: any,
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
    createTransaction: async (_: any, { input }: { input: any }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      // Verify category exists and belongs to user
      const category = await Category.findOne({
        _id: input.categoryId,
        user: context.user._id
      });
      
      if (!category) throw new Error('Category not found');

      const { categoryId, ...transactionData } = input;
      const transaction = new Transaction({
        ...transactionData,
        category: category._id,
        user: context.user._id,
        date: input.date ? new Date(input.date) : new Date()
      });

      const savedTransaction = await transaction.save();
      return Transaction.findById(savedTransaction._id).populate('category');
    },

    updateTransaction: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: IContext
    ) => {
      if (!context.user) throw new Error('Not authenticated');

      // Verify transaction exists and belongs to user
      const transaction = await Transaction.findOne({
        _id: id,
        user: context.user._id
      });

      if (!transaction) throw new Error('Transaction not found');

      // If category is being updated, verify it exists and belongs to user
      if (input.categoryId) {
        const category = await Category.findOne({
          _id: input.categoryId,
          user: context.user._id
        });
        if (!category) throw new Error('Category not found');
        input.category = category._id;
        delete input.categoryId;
      }

      // Update transaction
      Object.assign(transaction, {
        ...input,
        date: input.date ? new Date(input.date) : transaction.date
      });

      return transaction.save();
    },

    deleteTransaction: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const result = await Transaction.findOneAndDelete({
        _id: id,
        user: context.user._id
      });

      return !!result;
    },
  },
}; 