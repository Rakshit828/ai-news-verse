import { useState, useCallback } from 'react';
import { SuccessResponse, ApiError } from '../types/api.types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<SuccessResponse<T>>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiCall();
      setState({
        data: response.data || null,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        name: 'ApiError',
        message: error.message || 'An error occurred',
        status_code: error.status_code,
        error: error.error,
      };
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
      throw apiError;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}

export function useAsyncApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<SuccessResponse<T>>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiCall();
      setState({
        data: response.data || null,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        name: 'ApiError',
        message: error.message || 'An error occurred',
        status_code: error.status_code,
        error: error.error,
      };
      setState((prev) => ({
        data: prev.data,
        loading: false,
        error: apiError,
      }));
      throw apiError;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}