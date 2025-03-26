import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Box,
  LinearProgress,
} from '@mui/material';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface CategorySummaryProps {
  categories: Category[];
  transactions: Transaction[];
  onCategorySelect: (categoryId: string | null) => void;
}

export const CategorySummary: React.FC<CategorySummaryProps> = ({
  categories,
  transactions,
  onCategorySelect,
}) => {
  // Calculate total expenses
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate expenses by category
  const expensesByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((category) => {
      const categoryTransactions = transactions.filter(
        (t) => t.category.id === category.id && t.type === 'expense'
      );
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

      return {
        ...category,
        total,
        percentage,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Spending by Category
      </Typography>
      <List>
        {expensesByCategory.map((category) => (
          <ListItem key={category.id} disablePadding>
            <ListItemButton onClick={() => onCategorySelect(category.id)}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1" component="div">
                  {category.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    ${category.total.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.percentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={category.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 