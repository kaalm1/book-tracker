export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }
  
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }
