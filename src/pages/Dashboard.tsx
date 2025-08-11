import React, { useState } from 'react';
import { User } from '../types';
import { Layout } from '../components/layout/Layout';
import { BookList } from '../components/books/BookList';
import { SearchResults } from '../components/search/SearchResults';
import { NotificationPanel } from '../components/notifications/NotificationPanel';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { useSearch } from '@/hooks/useSearch';
import { useNotifications } from '@/hooks/useNotifications';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { signOut } = useAuth();
  const { books, addBook, removeBook, loading: booksLoading } = useBooks(user.uid);
  const { searchResults, searchBook, loading: searchLoading } = useSearch();
  const { notifications, addNotification } = useNotifications(user.uid);
  const [showSettings, setShowSettings] = useState(false);

  const handleAddBook = async (title: string, author?: string) => {
    await addBook(title, author);
  };

  const handleRemoveBook = async (bookId: string) => {
    await removeBook(bookId);
  };

  const handleSearchBook = async (bookTitle: string) => {
    await searchBook(bookTitle);
  };

  const handleNotifyMe = async (searchResult: any) => {
    const notification = {
      bookTitle: searchResult.title,
      price: searchResult.price,
      source: searchResult.source,
      link: searchResult.link,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    
    await addNotification(notification);
    
    // Show success message
    alert(`Email notification sent! Found "${searchResult.title}" for ${searchResult.price} on ${searchResult.source}`);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <Layout
      user={user}
      notificationCount={notifications.filter(n => !n.read).length}
      onSignOut={signOut}
      onToggleSettings={handleToggleSettings}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Management */}
        <div className="lg:col-span-2">
          <BookList
            books={books}
            onAddBook={handleAddBook}
            onRemoveBook={handleRemoveBook}
            onSearchBook={handleSearchBook}
            loading={booksLoading}
            searchLoading={searchLoading}
          />
        </div>

        {/* Notifications & Search Results */}
        <div className="space-y-6">
          <NotificationPanel notifications={notifications} />
          
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            onNotifyMe={handleNotifyMe}
          />
        </div>
      </div>
    </Layout>
  );
};
