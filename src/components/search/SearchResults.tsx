import React from 'react';
import { SearchResult } from '../../types';
import { SearchResultItem } from './SearchResultItem';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onNotifyMe: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onNotifyMe
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <LoadingSpinner size="lg" className="text-indigo-600 mx-auto mb-2" />
        <p className="text-gray-600">Searching across all platforms...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Search Results ({results.length} found)
      </h3>
      
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            onNotifyMe={onNotifyMe}
          />
        ))}
      </div>
    </div>
  );
};
