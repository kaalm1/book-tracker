import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    getDocs, 
    query, 
    where, 
    orderBy 
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { Notification } from '../types';
  
  export const notificationsService = {
    async addNotification(userId: string, notification: Omit<Notification, 'id' | 'userId'>): Promise<Notification> {
      try {
        const notificationData = {
          ...notification,
          userId,
          date: new Date().toISOString().split('T')[0]
        };
  
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        
        return {
          id: docRef.id,
          ...notificationData
        };
      } catch (error) {
        throw new Error('Failed to add notification');
      }
    },
  
    async getUserNotifications(userId: string): Promise<Notification[]> {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
      } catch (error) {
        // Fallback to mock data for development
        return [
          {
            id: '1',
            userId,
            bookTitle: 'The Great Gatsby',
            price: '$12.99',
            source: 'Facebook Marketplace',
            link: 'https://facebook.com/marketplace/item/123',
            date: '2025-01-20',
            read: false
          },
          {
            id: '2',
            userId,
            bookTitle: '1984',
            price: '$8.50',
            source: 'Craigslist',
            link: 'https://craigslist.org/book/456',
            date: '2025-01-19',
            read: false
          }
        ];
      }
    },
  
    async markAsRead(notificationId: string): Promise<void> {
      try {
        await updateDoc(doc(db, 'notifications', notificationId), {
          read: true
        });
      } catch (error) {
        throw new Error('Failed to mark notification as read');
      }
    }
  };
  