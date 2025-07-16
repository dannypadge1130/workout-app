import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
}