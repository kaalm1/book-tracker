export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  addedDate: string;
  userId: string;
}

export interface SearchResult {
  id: string;
  title: string;
  price: string;
  source: string;
  condition?: string;
  link: string;
  seller?: string;
  imageUrl?: string;
}

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

export type SearchSource = 'facebook' | 'craigslist' | 'reddit' | 'ebay' | 'amazon';
