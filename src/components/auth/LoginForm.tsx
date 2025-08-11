import React from 'react';
import { Book, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface LoginFormProps {
  onSignIn: () => void;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSignIn, loading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Book className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Tracker</h1>
          <p className="text-gray-600">
            Track your favorite books and get notified when they're available for purchase
          </p>
        </div>
        
        <Button
          onClick={onSignIn}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              Sign in with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
