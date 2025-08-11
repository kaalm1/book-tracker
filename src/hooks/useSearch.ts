import { useState } from 'react';
import { SearchResult } from '../types';
import { SearchServiceClass } from '../services/search.service';


export const SearchService = new SearchServiceClass();

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBook = async (bookTitle: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await SearchService.searchAllSources(bookTitle);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    searchBook,
    clearResults
  };
};
