import { ReactNode, useEffect, useState } from 'react';
import { authService } from '../../../api/auth';
import { User } from '../types/interfaces';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const userId = user?.id ?? null;
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Validate token here if needed
          setToken(storedToken);
          setRefreshToken(localStorage.getItem('refreshToken'));
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (user: User, token: string, refreshToken: string) => {
    setUser(user);
    setToken(token);
    setRefreshToken(refreshToken);

    // Use try-catch to handle potential localStorage errors
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save auth data to localStorage', error);
    }
  };

  const register = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      const { user, token, refreshToken } = await authService.register(name, email);
      handleAuthSuccess(user, token, refreshToken);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const { user, token, refreshToken } = await authService.verifyCode(email, code);
      handleAuthSuccess(user, token, refreshToken);
    } catch (error) {
      console.error('Code verification failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const { user, token, refreshToken } = await authService.login(email, code);
      handleAuthSuccess(user, token, refreshToken);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestCode = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.requestVerificationCode(email);
    } catch (error) {
      console.error('Failed to request verification code', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth data from localStorage', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        token,
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        login,
        register,
        verifyCode,
        logout,
        requestCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
