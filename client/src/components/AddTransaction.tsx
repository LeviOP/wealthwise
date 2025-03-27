import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
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
  }
`;

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface AddTransactionProps {
  categories: Category[];
  onTransactionAdded: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({
  categories,
  onTransactionAdded,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [createTransaction] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: ['GetBudgets'],
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await createTransaction({
        variables: {
          input: {
            amount: parseFloat(formData.amount),
            type: formData.type,
            description: formData.description,
            categoryId: formData.categoryId,
            date: formData.date,
          },
        },
      });

      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        description: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
      });

      onTransactionAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
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
        Add Transaction
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            sx={{ flex: 1 }}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
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
              .filter((category) => category.type === formData.type)
              .map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            required
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            sx={{ flex: 2 }}
          />
          <TextField
            required
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.amount || !formData.categoryId || !formData.description}
          >
            Add Transaction
          </Button>
        </Box>
      </form>
    </Paper>
  );
}; 