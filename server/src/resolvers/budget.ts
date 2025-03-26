import { Budget } from '../models/Budget';
import { Category } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { IContext } from '../types/context';

const calculateBudgetProgress = async (
  budget: any,
  startDate: Date,
  endDate: Date
) => {
  const transactions = await Transaction.find({
    category: budget.category,
    date: { $gte: startDate, $lte: endDate },
    type: 'expense',
  });

  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget.amount - spent;
  const percentageUsed = (spent / budget.amount) * 100;

  return {
    spent,
    remaining,
    percentageUsed,
  };
};

export const budgetResolvers = {
  Query: {
    budgets: async (_: any, __: any, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const budgets = await Budget.find({ user: context.user._id })
        .populate('category');

      // Calculate progress for each budget
      const budgetsWithProgress = await Promise.all(
        budgets.map(async (budget) => {
          const startDate = new Date(budget.startDate);
          const endDate = new Date();
          
          if (budget.period === 'monthly') {
            startDate.setDate(1); // First day of the month
            endDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0); // Last day of the month
          } else {
            startDate.setMonth(0, 1); // First day of the year
            endDate.setMonth(11, 31); // Last day of the year
          }

          const progress = await calculateBudgetProgress(budget, startDate, endDate);
          return {
            ...budget.toObject(),
            ...progress,
          };
        })
      );

      return budgetsWithProgress;
    },

    budget: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const budget = await Budget.findOne({
        _id: id,
        user: context.user._id,
      }).populate('category');

      if (!budget) return null;

      const startDate = new Date(budget.startDate);
      const endDate = new Date();
      
      if (budget.period === 'monthly') {
        startDate.setDate(1);
        endDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else {
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
      }

      const progress = await calculateBudgetProgress(budget, startDate, endDate);
      return {
        ...budget.toObject(),
        ...progress,
      };
    },

    budgetsByPeriod: async (_: any, { period }: { period: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const budgets = await Budget.find({
        user: context.user._id,
        period,
      }).populate('category');

      return Promise.all(
        budgets.map(async (budget) => {
          const startDate = new Date(budget.startDate);
          const endDate = new Date();
          
          if (budget.period === 'monthly') {
            startDate.setDate(1);
            endDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
          } else {
            startDate.setMonth(0, 1);
            endDate.setMonth(11, 31);
          }

          const progress = await calculateBudgetProgress(budget, startDate, endDate);
          return {
            ...budget.toObject(),
            ...progress,
          };
        })
      );
    },

    budgetsByCategory: async (_: any, { categoryId }: { categoryId: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const budgets = await Budget.find({
        user: context.user._id,
        category: categoryId,
      }).populate('category');

      return Promise.all(
        budgets.map(async (budget) => {
          const startDate = new Date(budget.startDate);
          const endDate = new Date();
          
          if (budget.period === 'monthly') {
            startDate.setDate(1);
            endDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
          } else {
            startDate.setMonth(0, 1);
            endDate.setMonth(11, 31);
          }

          const progress = await calculateBudgetProgress(budget, startDate, endDate);
          return {
            ...budget.toObject(),
            ...progress,
          };
        })
      );
    },
  },

  Mutation: {
    createBudget: async (_: any, { input }: { input: any }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      // Verify category exists and belongs to user
      const category = await Category.findOne({
        _id: input.categoryId,
        user: context.user._id,
      });
      
      if (!category) throw new Error('Category not found');

      const budget = new Budget({
        ...input,
        user: context.user._id,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
      });

      return budget.save();
    },

    updateBudget: async (_: any, { id, input }: { id: string; input: any }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');

      const budget = await Budget.findOne({
        _id: id,
        user: context.user._id,
      });

      if (!budget) throw new Error('Budget not found');

      Object.assign(budget, {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : budget.startDate,
      });

      return budget.save();
    },

    deleteBudget: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const result = await Budget.findOneAndDelete({
        _id: id,
        user: context.user._id,
      });

      return !!result;
    },
  },
}; 