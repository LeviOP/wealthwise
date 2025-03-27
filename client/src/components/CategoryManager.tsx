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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      type
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      type
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoryUpdated: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoryUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (editingCategory) {
        await updateCategory({
          variables: {
            id: editingCategory.id,
            input: formData,
          },
        });
      } else {
        await createCategory({
          variables: {
            input: formData,
          },
        });
      }

      // Reset form
      setFormData({
        name: '',
        type: 'expense',
      });
      setEditingCategory(null);
      onCategoryUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory({ variables: { id } });
      onCategoryUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
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
        Manage Categories
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
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ flex: 2 }}
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.name}
          >
            {editingCategory ? 'Update' : 'Add'} Category
          </Button>
        </Box>
      </form>

      <List>
        {categories.map((category) => (
          <ListItem key={category.id}>
            <ListItemText
              primary={category.name}
              secondary={`Type: ${category.type}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleEdit(category)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDelete(category.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 