// AuthContext.tsx - UPDATE THIS

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  UserResponseSchema,
  UserCreateSchema,
  UserLogInSchema,
} from '../types/api.types';

interface AuthContextType {
  user: UserResponseSchema | null;
  loading: boolean;
  error: string | null;
  signup: (data: UserCreateSchema) => Promise<void>;
  login: (data: UserLogInSchema) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseSchema | null>(null);
  const [loading, setLoading] = useState(true); // Start with true for initial check
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user has valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to fetch news or categories to verify session is valid
        // If this succeeds, user has a valid token cookie
        const response = await fetch('http://localhost:8000/api/v1/news/get/my-categories', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          // User has valid session, set authenticated
          setIsAuthenticated(true);
          // Could also fetch user data here if you have a /me endpoint
        } else if (response.status === 401) {
          // No valid session
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log('Session check failed, user not authenticated');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signup = useCallback(async (data: UserCreateSchema) => {
    setLoading(true);
    setError(null);
    try {
      await authService.signup(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: UserLogInSchema) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}