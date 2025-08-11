import { SearchResult, SearchSource } from '../types';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; // Assuming you export functions from your firebase config


export class SearchServiceClass {
    async searchAllSources(bookTitle: string, author?: string): Promise<SearchResult[]> {
        try {
          const searchBookFunction = httpsCallable<
            { bookTitle: string; author?: string },
            { results: SearchResult[] }
          >(functions, 'searchBook');
      
          const result = await searchBookFunction({ bookTitle, author });
          return result.data.results || [];
        } catch (error) {
          console.error('Error searching all sources:', error);
          return this.getMockResults(bookTitle);
        }
      }

  async searchSingleSource(bookTitle: string, source: SearchSource): Promise<SearchResult[]> {
    switch (source) {
      case 'facebook':
        return this.searchFacebookMarketplace(bookTitle);
      case 'craigslist':
        return this.searchCraigslist(bookTitle);
      case 'reddit':
        return this.searchReddit(bookTitle);
      default:
        return [];
    }
  }

  private async searchFacebookMarketplace(bookTitle: string): Promise<SearchResult[]> {
    // Facebook Marketplace search implementation
    console.log(`Searching Facebook Marketplace for: ${bookTitle}`);
    return [];
  }

  private async searchCraigslist(bookTitle: string): Promise<SearchResult[]> {
    // Craigslist search implementation
    console.log(`Searching Craigslist for: ${bookTitle}`);
    return [];
  }

  private async searchReddit(bookTitle: string): Promise<SearchResult[]> {
    // Reddit search implementation
    console.log(`Searching Reddit for: ${bookTitle}`);
    return [];
  }

  private getMockResults(bookTitle: string): SearchResult[] {
    return [
      {
        id: '1',
        title: `${bookTitle} - First Edition`,
        price: '$15.99',
        source: 'craigslist',
        condition: 'Used - Good',
        link: 'https://craigslist.org/example',
        seller: 'BookLover123'
      },
      {
        id: '2',
        title: `${bookTitle} (Paperback)`,
        price: '$10.50',
        source: 'reddit',
        condition: 'Used - Very Good',
        link: 'https://reddit.com/r/bookexchange/example',
        seller: 'u/BookTrader'
      }
    ];
  }
}