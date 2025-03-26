import { User } from '../models/User';
import { Category } from '../models/Category';
import { generateToken } from '../utils/jwt';
import { GraphQLError } from 'graphql';

const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investments', type: 'income' },
  { name: 'Other Income', type: 'income' },
  
  // Expense categories
  { name: 'Housing', type: 'expense' },
  { name: 'Transportation', type: 'expense' },
  { name: 'Food & Dining', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Insurance', type: 'expense' },
  { name: 'Healthcare', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Other Expenses', type: 'expense' },
];

export const authResolvers = {
  Mutation: {
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      
      if (!user || !(await user.comparePassword(password))) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    },

    register: async (_: any, { email, password, firstName, lastName }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'USER_EXISTS' },
        });
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
      });

      await user.save();

      // Create default categories for the new user
      const defaultCategories = DEFAULT_CATEGORIES.map(category => ({
        ...category,
        user: user._id,
      }));

      await Category.insertMany(defaultCategories);

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    },
  },
}; 