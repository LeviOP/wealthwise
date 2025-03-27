import { IBudget } from '../models/Budget';
import { IContext } from '../middleware/auth';
import { Budget } from '../models/Budget';
import { Types } from 'mongoose';

interface BudgetInput {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
}

export const budgetResolvers = {
  Budget: {
    id: (parent: IBudget) => (parent._id as Types.ObjectId).toString(),
    category: (parent: IBudget) => parent.category,
    amount: (parent: IBudget) => parent.amount,
    period: (parent: IBudget) => parent.period,
    startDate: (parent: IBudget) => parent.startDate.toISOString(),
    createdAt: (parent: IBudget) => parent.createdAt.toISOString(),
    updatedAt: (parent: IBudget) => parent.updatedAt.toISOString(),
  },

  Query: {
    budgets: async (_: unknown, __: unknown, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.find({ user: context.user._id }).sort({ startDate: -1 });
    },

    budget: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.findOne({ _id: id, user: context.user._id });
    },

    budgetsByPeriod: async (_: unknown, { period }: { period: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.find({ user: context.user._id, period }).sort({ startDate: -1 });
    },

    budgetsByCategory: async (_: unknown, { categoryId }: { categoryId: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.find({ user: context.user._id, category: categoryId }).sort({ startDate: -1 });
    },
  },

  Mutation: {
    createBudget: async (_: unknown, { input }: { input: BudgetInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      const budget = new Budget({
        ...input,
        user: context.user._id,
        startDate: new Date(input.startDate),
      });
      return budget.save();
    },

    updateBudget: async (_: unknown, { id, input }: { id: string; input: BudgetInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.findOneAndUpdate(
        { _id: id, user: context.user._id },
        {
          ...input,
          startDate: new Date(input.startDate),
        },
        { new: true }
      );
    },

    deleteBudget: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Budget.findOneAndDelete({ _id: id, user: context.user._id });
    },
  },
}; 