import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CategoryManager } from './CategoryManager';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      type
    }
  }
`;

export const CategoriesPage: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES);

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
        <Alert severity="error">Error loading categories: {error.message}</Alert>
      </Container>
    );
  }

  const categories = data?.categories || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Category Management
      </Typography>
      <CategoryManager categories={categories} onCategoryUpdated={refetch} />
    </Container>
  );
}; 