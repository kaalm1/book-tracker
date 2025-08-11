export const SEARCH_SOURCES: Record<SearchSource, string> = {
    facebook: 'Facebook Marketplace',
    craigslist: 'Craigslist',
    reddit: 'Reddit',
    ebay: 'eBay',
    amazon: 'Amazon'
  };
  
  export const FIREBASE_COLLECTIONS = {
    USERS: 'users',
    BOOKS: 'books',
    NOTIFICATIONS: 'notifications'
  } as const;
  
  export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    LOGIN: '/login'
  } as const;
  