import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ApolloProvider, useQuery } from '@apollo/client';
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
import { gql } from '@apollo/client';

// Create an auth context
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VERIFY_TOKEN = gql`
  query VerifyToken {
    me {
      id
      email
      firstName
      lastName
    }
  }
`;

// Auth provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { loading, error } = useQuery(VERIFY_TOKEN, {
    skip: !localStorage.getItem('token'),
    onCompleted: () => {
      setIsAuthenticated(true);
      setIsLoading(false);
    },
    onError: () => {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoading(false);
    },
  });

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component for authenticated routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Public Route component for unauthenticated routes (login/register)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Header component that always shows the title but only shows navigation when authenticated
const Header: React.FC = () => {
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

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth={false} sx={{ mt: 4, mb: 4, flex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
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
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
