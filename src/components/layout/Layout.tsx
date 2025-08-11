import React, { ReactNode } from 'react';
import { Header } from './Header';
import { User } from '../../types';

interface LayoutProps {
  user: User;
  notificationCount: number;
  onSignOut: () => void;
  onToggleSettings: () => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  user,
  notificationCount,
  onSignOut,
  onToggleSettings,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        notificationCount={notificationCount}
        onSignOut={onSignOut}
        onToggleSettings={onToggleSettings}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
