import { useState, useCallback, useEffect } from 'react';
import { newsService } from '../services/newsService';
import {
  ResponseCategoryData,
  SetCategoriesUsers,
  UpdateCategoriesUsers,
  CreateCategoryData,
  AddSubcategoriesToCategorySchema,
  TodayNewsResponse,
  ApiErrorDetails,
} from '../types/api.types';

interface UseNewsState {
  categories: ResponseCategoryData[] | null;
  news: TodayNewsResponse | null;
  loading: boolean;
  error: ApiErrorDetails | null;
}

interface UseNewsActions {
  setUserCategories: (data: SetCategoriesUsers) => Promise<void>;
  updateUserCategories: (data: UpdateCategoriesUsers) => Promise<void>;
  getUserCategories: () => Promise<void>;
  createCustomCategory: (data: CreateCategoryData) => Promise<void>;
  addSubcategoriesToCategory: (data: AddSubcategoriesToCategorySchema) => Promise<void>;
  getTodayNews: () => Promise<void>;
  clearError: () => void;
}

export function useNews(): UseNewsState & UseNewsActions {
  const [categories, setCategories] = useState<ResponseCategoryData[] | null>(null);
  const [news, setNews] = useState<TodayNewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorDetails | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = (err: any) => {
    setError(err);
  };

  const setUserCategories = useCallback(async (data: SetCategoriesUsers) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.setUserCategories(data);
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserCategories = useCallback(async (data: UpdateCategoriesUsers) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.updateUserCategories(data);
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.getUserCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomCategory = useCallback(async (data: CreateCategoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.createCustomCategory(data);
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addSubcategoriesToCategory = useCallback(
    async (data: AddSubcategoriesToCategorySchema) => {
      setLoading(true);
      setError(null);
      try {
        const response = await newsService.addSubcategoriesToCategory(data);
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err: any) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getTodayNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.getTodayNews();
      if (response.data) {
        setNews(response.data);
      }
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch news on mount
  useEffect(() => {
    getTodayNews();
  }, [getTodayNews]);

  return {
    categories,
    news,
    loading,
    error,
    setUserCategories,
    updateUserCategories,
    getUserCategories,
    createCustomCategory,
    addSubcategoriesToCategory,
    getTodayNews,
    clearError,
  };
}