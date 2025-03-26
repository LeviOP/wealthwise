import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TransactionList } from './TransactionList';
import { CategorySummary } from './CategorySummary';
import { AddTransaction } from './AddTransaction';
import { CategoryManager } from './CategoryManager';
import { BudgetManager } from './BudgetManager';

const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      amount
      type
      description
      date
      category {
        id
        name
        type
      }
    }
    categories {
      id
      name
      type
    }
  }
`;

export const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_TRANSACTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error loading dashboard data: {error.message}</Alert>
      </Container>
    );
  }

  const transactions = data?.transactions || [];
  const categories = data?.categories || [];

  // Calculate total income and expenses
  const totals = transactions.reduce(
    (acc: { income: number; expense: number }, transaction: { type: string; amount: number }) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Income
            </Typography>
            <Typography component="p" variant="h4" color="success.main">
              ${totals.income.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography component="p" variant="h4" color="error.main">
              ${totals.expense.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Net Balance
            </Typography>
            <Typography
              component="p"
              variant="h4"
              color={totals.income - totals.expense >= 0 ? 'success.main' : 'error.main'}
            >
              ${(totals.income - totals.expense).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Category Management */}
        <Grid item xs={12}>
          <CategoryManager categories={categories} onCategoryUpdated={refetch} />
        </Grid>

        {/* Budget Management */}
        <Grid item xs={12}>
          <BudgetManager />
        </Grid>

        {/* Add Transaction Form */}
        <Grid item xs={12}>
          <AddTransaction categories={categories} onTransactionAdded={refetch} />
        </Grid>

        {/* Category Summary */}
        <Grid item xs={12} md={6}>
          <CategorySummary
            categories={categories}
            transactions={transactions}
            onCategorySelect={setSelectedCategory}
          />
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <TransactionList
            transactions={transactions}
            categories={categories}
            selectedCategory={selectedCategory}
            onTransactionUpdated={refetch}
          />
        </Grid>
      </Grid>
    </Container>
  );
}; 