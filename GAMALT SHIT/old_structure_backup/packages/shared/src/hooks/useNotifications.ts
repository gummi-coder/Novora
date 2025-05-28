import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { NotificationService, Notification } from '../services/notification-service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const notificationService = NotificationService.getInstance();
      const [notifications, count] = await Promise.all([
        notificationService.getUserNotifications(user.id),
        notificationService.getUnreadCount(user.id),
      ]);

      setNotifications(notifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const notificationService = NotificationService.getInstance();
      await Promise.all(
        notifications
          .filter(notification => !notification.read)
          .map(notification => notificationService.markAsRead(notification.id))
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, notifications]);

  useEffect(() => {
    fetchNotifications();

    // Set up real-time notifications
    if (user) {
      const notificationService = NotificationService.getInstance();
      const channel = `notifications:${user.id}`;

      // Subscribe to Redis channel for real-time updates
      const subscription = notificationService.subscribe(channel, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
} 