import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          WealthWise
        </Typography>
        {isAuthenticated && (
          <>
            <ButtonGroup variant="text" color="inherit" sx={{ mr: 2 }}>
              <Button component={Link} to="/dashboard" color="inherit">
                Dashboard
              </Button>
              <Button component={Link} to="/categories" color="inherit">
                Categories
              </Button>
              <Button component={Link} to="/budgets" color="inherit">
                Budgets
              </Button>
            </ButtonGroup>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}; 