import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { UserResponseSchema, UserCreateSchema, UserLogInSchema } from '../types/api.types';

interface AuthContextType {
  user: UserResponseSchema | null;
  loading: boolean;
  error: string | null;
  signup: (data: UserCreateSchema) => Promise<void>;
  login: (data: UserLogInSchema) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (data: UserCreateSchema) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      if (response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: UserLogInSchema) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(data);
      // Note: You might want to fetch user data here
      setUser({} as UserResponseSchema); // Placeholder
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        isAuthenticated: authService.isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}