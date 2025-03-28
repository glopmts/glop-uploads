import { createContext } from 'react';
import { User } from '../types/interfaces';
export interface AuthContextType {
  user: User | null;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, code: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
  requestCode: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
