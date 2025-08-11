import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { notificationsService } from '../services/notifications.service';

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const userNotifications = await notificationsService.getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'userId'>) => {
    if (!userId) return;

    try {
      setError(null);
      const newNotification = await notificationsService.addNotification(userId, notification);
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification');
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setError(null);
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  return {
    notifications,
    loading,
    error,
    addNotification,
    markAsRead,
    refreshNotifications: loadNotifications
  };
};
