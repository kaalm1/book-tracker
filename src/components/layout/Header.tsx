import React from 'react';
import { Book, Bell, Settings, LogOut } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  notificationCount: number;
  onSignOut: () => void;
  onToggleSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notificationCount,
  onSignOut,
  onToggleSettings
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Book className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-xl font-semibold text-gray-900">Book Tracker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </div>
            
            <button
              onClick={onToggleSettings}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full border border-gray-200"
                />
              )}
              <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
                {user.displayName || user.email}
              </span>
            </div>
            
            <button
              onClick={onSignOut}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-md hover:bg-gray-100"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
