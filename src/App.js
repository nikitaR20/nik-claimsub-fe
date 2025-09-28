import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import ProviderManagement from './components/ProviderManagement';
import ClaimsManagement from './components/ClaimsManagement';
import InsuranceManagement from './components/InsuranceManagement';
import UserManagement from './components/UserManagement';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { API_BASE_URL } from './config/api';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={logout} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProviderManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClaimsManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/insurance"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InsuranceManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;