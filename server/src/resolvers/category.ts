import { Category } from '../models/Category';
import { IContext } from '../types/context';

export const categoryResolvers = {
  Category: {
    id: (parent: any) => parent._id.toString(),
  },

  Query: {
    categories: async (_: any, __: any, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.find({ user: context.user._id }).sort({ name: 1 });
    },

    category: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.findOne({ _id: id, user: context.user._id });
    },

    categoriesByType: async (_: any, { type }: { type: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      return Category.find({ user: context.user._id, type }).sort({ name: 1 });
    },
  },

  Mutation: {
    createCategory: async (_: any, { input }: { input: any }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const category = new Category({
        ...input,
        user: context.user._id
      });

      return category.save();
    },

    updateCategory: async (_: any, { id, input }: { id: string; input: any }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');

      const category = await Category.findOneAndUpdate(
        { _id: id, user: context.user._id },
        input,
        { new: true }
      );

      if (!category) throw new Error('Category not found');

      return category;
    },

    deleteCategory: async (_: any, { id }: { id: string }, context: IContext) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const result = await Category.findOneAndDelete({
        _id: id,
        user: context.user._id
      });

      return !!result;
    },
  },
}; 