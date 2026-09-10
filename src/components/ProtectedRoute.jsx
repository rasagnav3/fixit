import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingState from './LoadingState';

export function ProtectedRoute({
  children,
  currentUser,
  profile,
  loading,
  requireAdmin = false
}) {
  const location = useLocation();

  if (loading) {
    return <LoadingState fullScreen message="Authenticating campus session..." />;
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin role and user is student, redirect to home
  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
