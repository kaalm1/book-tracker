export interface Notification {
    id: string;
    userId: string;
    bookTitle: string;
    price: string;
    source: string;
    link: string;
    date: string;
    read: boolean;
  }
  
export interface NotificationState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
  }
