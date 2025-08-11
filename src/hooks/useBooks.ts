import { useState, useEffect } from 'react';
import { Book } from '../types';
import { booksService } from '../services/books.service';

export const useBooks = (userId: string | null) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadBooks();
    }
  }, [userId]);

  const loadBooks = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const userBooks = await booksService.getUserBooks(userId);
      setBooks(userBooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (title: string, author?: string) => {
    if (!userId) return;

    try {
      setError(null);
      const newBook = await booksService.addBook(userId, { title, author });
      setBooks(prev => [newBook, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
    }
  };

  const removeBook = async (bookId: string) => {
    try {
      setError(null);
      await booksService.removeBook(bookId);
      setBooks(prev => prev.filter(book => book.id !== bookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove book');
    }
  };

  return {
    books,
    loading,
    error,
    addBook,
    removeBook,
    refreshBooks: loadBooks
  };
};