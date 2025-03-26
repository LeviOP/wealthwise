import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  LinearProgress,
  Grid,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const GET_BUDGETS = gql`
  query GetBudgets {
    budgets {
      id
      category {
        id
        name
        type
      }
      amount
      period
      startDate
      spent
      remaining
      percentageUsed
    }
    categories {
      id
      name
      type
    }
  }
`;

const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id
      category {
        id
        name
        type
      }
      amount
      period
      startDate
      spent
      remaining
      percentageUsed
    }
  }
`;

const UPDATE_BUDGET = gql`
  mutation UpdateBudget($id: ID!, $input: UpdateBudgetInput!) {
    updateBudget(id: $id, input: $input) {
      id
      category {
        id
        name
        type
      }
      amount
      period
      startDate
      spent
      remaining
      percentageUsed
    }
  }
`;

const DELETE_BUDGET = gql`
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`;

interface Budget {
  id: string;
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export const BudgetManager: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_BUDGETS);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createBudget] = useMutation(CREATE_BUDGET);
  const [updateBudget] = useMutation(UPDATE_BUDGET);
  const [deleteBudget] = useMutation(DELETE_BUDGET);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert severity="error">Error loading budgets: {error.message}</Alert>;

  const budgets = data?.budgets || [];
  const categories = data?.categories || [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      if (editingBudget) {
        await updateBudget({
          variables: {
            id: editingBudget.id,
            input: {
              amount: parseFloat(formData.amount),
              period: formData.period,
              startDate: formData.startDate,
            },
          },
        });
      } else {
        await createBudget({
          variables: {
            input: {
              categoryId: formData.categoryId,
              amount: parseFloat(formData.amount),
              period: formData.period,
              startDate: formData.startDate,
            },
          },
        });
      }

      // Reset form
      setFormData({
        categoryId: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
      });
      setEditingBudget(null);
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.category.id,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate.split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget({ variables: { id } });
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Budget Management
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            required
            select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            sx={{ flex: 2 }}
          >
            {categories
              .filter((category: Category) => category.type === 'expense')
              .map((category: Category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            required
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ flex: 1 }}
          />
          <TextField
            required
            select
            label="Period"
            name="period"
            value={formData.period}
            onChange={handleChange}
            sx={{ flex: 1 }}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
          <TextField
            required
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.categoryId || !formData.amount}
          >
            {editingBudget ? 'Update' : 'Add'} Budget
          </Button>
        </Box>
      </form>

      <Grid container spacing={2}>
        {budgets.map((budget: Budget) => (
          <Grid item xs={12} key={budget.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {budget.category.name} ({budget.period})
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(budget)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(budget.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Budget: ${budget.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Spent: ${budget.spent.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Remaining: ${budget.remaining.toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(budget.percentageUsed, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: budget.percentageUsed > 100 ? 'error.main' : 'primary.main',
                  },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 