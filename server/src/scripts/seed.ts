import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Category } from '../models/Category';
import dotenv from 'dotenv';

dotenv.config();

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

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users and categories
    await User.deleteMany({});
    await Category.deleteMany({});
    
    // Create sample users
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
      },
      {
        email: 'user@example.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
      },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();

      // Create default categories for each user
      const defaultCategories = DEFAULT_CATEGORIES.map(category => ({
        ...category,
        user: user._id,
      }));

      await Category.insertMany(defaultCategories);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers(); 