import { User, IUser } from '../models/User';
import { Category } from '../models/Category';
import { generateToken } from '../utils/jwt';

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

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { user: IUser }) => {
      if (!context.user) throw new Error('Not authenticated');
      return User.findById(context.user._id);
    },
  },

  Mutation: {
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');

      const isValid = await user.comparePassword(password);
      if (!isValid) throw new Error('Invalid password');

      const token = generateToken(user);
      return { token, user };
    },

    register: async (_: unknown, { email, password, firstName, lastName }: RegisterInput) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');

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
      return { token, user };
    },
  },
}; 