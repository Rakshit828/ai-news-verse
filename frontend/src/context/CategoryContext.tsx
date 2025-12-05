
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { newsService } from '../services/newsService';
import {
  ResponseCategoryData,
  SetCategoriesUsers,
  UpdateCategoriesUsers,
} from '../types/api.types';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: ResponseCategoryData[] | null;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  setCategories: (data: SetCategoriesUsers) => Promise<void>;
  updateCategories: (data: UpdateCategoriesUsers) => Promise<void>;
  clearError: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ResponseCategoryData[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch categories when user authenticates
  useEffect(() => {
    if (isAuthenticated && categories === null) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.getUserCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetCategories = useCallback(async (data: SetCategoriesUsers) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.setUserCategories(data);
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to set categories';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateCategories = useCallback(
    async (data: UpdateCategoriesUsers) => {
      setLoading(true);
      setError(null);
      try {
        const response = await newsService.updateUserCategories(data);
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update categories';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    fetchCategories,
    setCategories: handleSetCategories,
    updateCategories: handleUpdateCategories,
    clearError,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;

}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}
