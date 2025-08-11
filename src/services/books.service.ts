import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { Book } from '../types';
  
  // Type for creating a new book - excludes auto-generated fields
  type CreateBookData = Omit<Book, 'id' | 'userId' | 'addedDate'>;
  
  export const booksService = {
    async addBook(userId: string, book: CreateBookData): Promise<Book> {
      try {
        const bookData = {
          ...book,
          userId,
          addedDate: new Date().toISOString().split('T')[0]
        };
  
        const docRef = await addDoc(collection(db, 'books'), bookData);
  
        return {
          id: docRef.id,
          ...bookData
        };
      } catch (error) {
        console.error('Error adding book:', error);
        throw new Error('Failed to add book');
      }
    },
  
    async removeBook(bookId: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (error) {
        console.error('Error removing book:', error);
        throw new Error('Failed to remove book');
      }
    },
  
    async getUserBooks(userId: string): Promise<Book[]> {
      try {
        const q = query(
          collection(db, 'books'),
          where('userId', '==', userId),
          orderBy('addedDate', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
  
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Book));
      } catch (error) {
        console.error('Error fetching books:', error);
        throw new Error('Failed to fetch books');
      }
    },
  
    // Optional: Add a method to search for a specific book manually
    async searchBook(bookTitle: string, author?: string): Promise<any> {
      try {
        // This would call your Firebase Cloud Function
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('./firebase'); // Assuming you export functions from firebase config
        
        const searchBookFunction = httpsCallable(functions, 'searchBook');
        const result = await searchBookFunction({ bookTitle, author });
        
        return result.data;
      } catch (error) {
        console.error('Error searching book:', error);
        throw new Error('Failed to search for book');
      }
    }
  };
  