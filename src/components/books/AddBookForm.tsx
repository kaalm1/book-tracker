import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '../ui/Input';

interface AddBookFormProps {
  onAddBook: (title: string, author?: string) => void;
  loading?: boolean;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ onAddBook, loading }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddBook(title.trim(), author.trim() || undefined);
      setTitle('');
      setAuthor('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title..."
          className="flex-1"
        />
        <Button type="submit" disabled={!title.trim() || loading}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <Input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Enter author (optional)..."
      />
    </form>
  );
};
