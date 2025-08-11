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
  
  export const booksService = {
    async addBook(userId: string, book: Omit<Book, 'id' | 'userId'>): Promise<Book> {
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
        throw new Error('Failed to add book');
      }
    },
  
    async removeBook(bookId: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (error) {
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
        throw new Error('Failed to fetch books');
      }
    }
  };
  