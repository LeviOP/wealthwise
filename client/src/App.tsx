import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { CategoriesPage } from './components/CategoriesPage';
import { BudgetsPage } from './components/BudgetsPage';
import { Container, Box } from '@mui/material';
import { AuthProvider, PublicRoute, ProtectedRoute } from './contexts/AuthContext';
import { Header } from './components/Header';

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
                <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
