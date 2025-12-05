import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { SuccessResponse, ErrorResponse, TokensSchema } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Include cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - Token Expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.setAccessToken(newToken);
            
            // Retry failed requests
            this.failedQueue.forEach((prom) => prom.resolve(newToken));
            this.failedQueue = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];
            
            // Clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const response = await this.client.get<SuccessResponse<null>>('/auth/refresh');
    if (response.data.data === null) {
      throw new Error('Failed to refresh token');
    }
    // The new access token is set in cookies via the backend
    return this.getAccessToken() || '';
  }

  public setTokens(tokens: TokensSchema) {
    // Tokens are set in httpOnly cookies by the backend
    // But we can store the access token in memory for convenience
    sessionStorage.setItem('access_token_temp', tokens.access_token);
  }

  public setAccessToken(token: string) {
    sessionStorage.setItem('access_token_temp', token);
  }

  public getAccessToken(): string | null {
    return sessionStorage.getItem('access_token_temp');
  }

  public clearTokens() {
    sessionStorage.removeItem('access_token_temp');
  }

  public async request<T = null>(
    method: string,
    url: string,
    data?: any,
    config?: any
  ): Promise<SuccessResponse<T>> {
    try {
      const response = await this.client.request<SuccessResponse<T>>({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public get<T = null>(url: string, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  public post<T = null>(url: string, data?: any, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  public put<T = null>(url: string, data?: any, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  public delete<T = null>(url: string, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private handleError(error: AxiosError<ErrorResponse>): Error {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status_code = error.response?.data?.status_code || error.response?.status;
    const apiError = new Error(message) as any;
    apiError.status_code = status_code;
    apiError.error = error.response?.data?.error;
    return apiError;
  }
}

export const apiClient = new ApiClient();