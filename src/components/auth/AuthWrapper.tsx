import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { Dashboard } from '@/pages/Dashboard';

export const AuthWrapper: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSignIn={signInWithGoogle} loading={loading} />;
  }

  return <Dashboard user={user} />;
};
