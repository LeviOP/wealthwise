import React from 'react';
import { Container, Typography } from '@mui/material';
import { BudgetManager } from './BudgetManager';

export const BudgetsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>
      <BudgetManager />
    </Container>
  );
}; 