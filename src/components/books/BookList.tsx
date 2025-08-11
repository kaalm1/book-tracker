import React from 'react';
import { Book } from 'lucide-react';
import { Book as BookType } from '../../types';
import { BookItem } from './BookItem';
import { AddBookForm } from './AddBookForm';

interface BookListProps {
  books: BookType[];
  onAddBook: (title: string, author?: string) => void;
  onRemoveBook: (bookId: string) => void;
  onSearchBook: (bookTitle: string) => void;
  loading?: boolean;
  searchLoading?: boolean;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  onAddBook,
  onRemoveBook,
  onSearchBook,
  loading,
  searchLoading
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Book List</h2>
      
      <AddBookForm onAddBook={onAddBook} loading={loading} />

      <div className="space-y-3">
        {books.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            onRemove={onRemoveBook}
            onSearch={onSearchBook}
            searchLoading={searchLoading}
          />
        ))}
        
        {books.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Book className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No books in your list yet. Add some books to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
