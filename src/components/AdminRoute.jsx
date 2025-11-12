// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { loading, user, isAdmin } = useAuth();

  // while loading, show nothing or spinner
  if (loading) return null; // or a spinner component

  // if not signed in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // if not admin, redirect to home (or a 403 page)
  if (!isAdmin) return <Navigate to="/" replace />;

  // user is admin -> render children
  return children;
}
