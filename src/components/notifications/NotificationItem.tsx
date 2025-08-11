import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  return (
    <div className="border-l-4 border-green-500 pl-4 py-3 hover:bg-gray-50 transition-colors">
      <h4 className="font-medium text-gray-900">{notification.bookTitle}</h4>
      <p className="text-sm text-gray-600">
        {notification.price} on {notification.source}
      </p>
      <p className="text-xs text-gray-500 mb-2">{notification.date}</p>
      <a 
        href={notification.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        View Listing
      </a>
    </div>
  );
};
