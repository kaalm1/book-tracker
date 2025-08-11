import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Book } from '../../types';
import { Button } from '../ui/Button';

interface BookItemProps {
  book: Book;
  onRemove: (bookId: string) => void;
  onSearch: (bookTitle: string) => void;
  searchLoading?: boolean;
}

export const BookItem: React.FC<BookItemProps> = ({ 
  book, 
  onRemove, 
  onSearch, 
  searchLoading 
}) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author || 'Unknown Author'}</p>
        <p className="text-xs text-gray-500">Added: {book.addedDate}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onSearch(book.title)}
          disabled={searchLoading}
          variant="success"
          size="sm"
        >
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
        
        <button
          onClick={() => onRemove(book.id)}
          className="text-red-600 hover:text-red-800 p-1 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
