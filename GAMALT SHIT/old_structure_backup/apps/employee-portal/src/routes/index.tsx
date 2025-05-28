import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { Dashboard } from '../components/Dashboard';
import { NotFound } from '../components/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}; 