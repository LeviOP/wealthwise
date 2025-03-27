import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { CategoriesPage } from './components/CategoriesPage';
import { BudgetsPage } from './components/BudgetsPage';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  ButtonGroup,
} from '@mui/material';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <ApolloProvider client={client}>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                WealthWise
              </Typography>
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
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 4, mb: 4, flex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute>
                    <BudgetsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ApolloProvider>
  );
}

export default App;
