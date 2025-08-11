export interface SearchResult {
    id: string;
    title: string;
    price: string;
    source: SearchSource;
    condition?: string;
    link: string;
    seller?: string;
    imageUrl?: string;
  }
  
export type SearchSource = 'facebook' | 'craigslist' | 'reddit' | 'ebay' | 'amazon';
  
export interface SearchState {
    results: SearchResult[];
    loading: boolean;
    error: string | null;
  }
