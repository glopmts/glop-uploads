import { createContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
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
