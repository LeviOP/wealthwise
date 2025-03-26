import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
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

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
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

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  selectedCategory: string | null;
  onTransactionUpdated: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  selectedCategory,
  onTransactionUpdated,
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction({ variables: { id } });
      onTransactionUpdated();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTransaction) return;

    try {
      await updateTransaction({
        variables: {
          id: editingTransaction.id,
          input: {
            amount: editingTransaction.amount,
            type: editingTransaction.type,
            description: editingTransaction.description,
            categoryId: editingTransaction.category.id,
            date: editingTransaction.date,
          },
        },
      });
      setEditingTransaction(null);
      onTransactionUpdated();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const filteredTransactions = selectedCategory
    ? transactions.filter((t) => t.category.id === selectedCategory)
    : transactions;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Transactions
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category.name}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: transaction.type === 'income' ? 'success.main' : 'error.main',
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(transaction)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(transaction.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editingTransaction} onClose={() => setEditingTransaction(null)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={editingTransaction?.amount || ''}
              onChange={(e) =>
                setEditingTransaction((prev) =>
                  prev ? { ...prev, amount: parseFloat(e.target.value) } : null
                )
              }
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={editingTransaction?.type || ''}
              onChange={(e) =>
                setEditingTransaction((prev) =>
                  prev ? { ...prev, type: e.target.value as 'income' | 'expense' } : null
                )
              }
              margin="normal"
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Description"
              value={editingTransaction?.description || ''}
              onChange={(e) =>
                setEditingTransaction((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={editingTransaction?.category.id || ''}
              onChange={(e) =>
                setEditingTransaction((prev) =>
                  prev
                    ? {
                        ...prev,
                        category: categories.find((c) => c.id === e.target.value) || prev.category,
                      }
                    : null
                )
              }
              margin="normal"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingTransaction(null)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}; 