import { ICategory } from '../models/Category';
import { IContext } from '../middleware/auth';
import { Category } from '../models/Category';

interface CategoryInput {
  name: string;
  type: 'income' | 'expense';
}

export const categoryResolvers = {
  Category: {
    id: (parent: ICategory) => (parent._id as unknown as { toString: () => string }).toString(),
    name: (parent: ICategory) => parent.name,
    type: (parent: ICategory) => parent.type,
    createdAt: (parent: ICategory) => parent.createdAt.toISOString(),
    updatedAt: (parent: ICategory) => parent.updatedAt.toISOString(),
  },

  Query: {
    categories: async (_: unknown, __: unknown, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.find({ user: context.user._id });
    },

    category: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.findOne({ _id: id, user: context.user._id });
    },

    categoriesByType: async (_: unknown, { type }: { type: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.find({ user: context.user._id, type });
    },
  },

  Mutation: {
    createCategory: async (_: unknown, { input }: { input: CategoryInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      const category = new Category({
        ...input,
        user: context.user._id,
      });
      return category.save();
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: CategoryInput }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.findOneAndUpdate(
        { _id: id, user: context.user._id },
        input,
        { new: true }
      );
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.findOneAndDelete({ _id: id, user: context.user._id });
    },
  },
}; 