import { IBudget } from '../models/Budget';
import { IContext } from '../middleware/auth';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

interface BudgetInput {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
}

function assertAuthenticated(context: IContext): asserts context is IContext & { user: IUser } {
  if (!context.user) {
    throw new Error('Not authenticated');
  }
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
    spent: async (parent: IBudget, _: unknown, context: IContext) => {
      assertAuthenticated(context);

      const startDate = new Date(parent.startDate);
      const endDate = new Date(startDate);
      if (parent.period === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const transactions = await Transaction.find({
        user: context.user._id,
        category: parent.category,
        type: 'expense',
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });

      return transactions.reduce((total, transaction) => total + transaction.amount, 0);
    },
    remaining: async (parent: IBudget, _: unknown, context: IContext) => {
      assertAuthenticated(context);
      const spent = await budgetResolvers.Budget.spent(parent, _, context);
      return Math.max(0, parent.amount - spent);
    },
    percentageUsed: async (parent: IBudget, _: unknown, context: IContext) => {
      assertAuthenticated(context);
      const spent = await budgetResolvers.Budget.spent(parent, _, context);
      return (spent / parent.amount) * 100;
    }
  },

  Query: {
    budgets: async (_: unknown, __: unknown, context: IContext) => {
      assertAuthenticated(context);
      return Budget.find({ user: context.user._id })
        .populate('category')
        .sort({ startDate: -1 });
    },

    budget: async (_: unknown, { id }: { id: string }, context: IContext) => {
      assertAuthenticated(context);
      return Budget.findOne({ _id: id, user: context.user._id })
        .populate('category');
    },

    budgetsByPeriod: async (_: unknown, { period }: { period: string }, context: IContext) => {
      assertAuthenticated(context);
      return Budget.find({ user: context.user._id, period })
        .populate('category')
        .sort({ startDate: -1 });
    },

    budgetsByCategory: async (_: unknown, { categoryId }: { categoryId: string }, context: IContext) => {
      assertAuthenticated(context);
      return Budget.find({ user: context.user._id, category: categoryId })
        .populate('category')
        .sort({ startDate: -1 });
    },
  },

  Mutation: {
    createBudget: async (_: unknown, { input }: { input: BudgetInput }, context: IContext) => {
      assertAuthenticated(context);
      const budget = new Budget({
        category: new Types.ObjectId(input.categoryId),
        amount: input.amount,
        period: input.period,
        startDate: new Date(input.startDate),
        user: context.user._id,
      });
      return budget.save().then(savedBudget => 
        Budget.findById(savedBudget._id).populate('category')
      );
    },

    updateBudget: async (_: unknown, { id, input }: { id: string; input: BudgetInput }, context: IContext) => {
      assertAuthenticated(context);
      return Budget.findOneAndUpdate(
        { _id: id, user: context.user._id },
        {
          ...input,
          category: input.categoryId ? new Types.ObjectId(input.categoryId) : undefined,
          startDate: new Date(input.startDate),
        },
        { new: true }
      ).populate('category');
    },

    deleteBudget: async (_: unknown, { id }: { id: string }, context: IContext) => {
      assertAuthenticated(context);
      return Budget.findOneAndDelete({ _id: id, user: context.user._id });
    },
  },
}; 