import React from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../../types';
import { NotificationItem } from './NotificationItem';

interface NotificationPanelProps {
  notifications: Notification[];
  loading?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  loading
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Bell className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Finds {notifications.length > 0 && `(${notifications.length})`}
        </h3>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
          
          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No recent notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
};
