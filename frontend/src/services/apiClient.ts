import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { SuccessResponse, ErrorResponse, ApiErrorDetails } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: () => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Include cookies with requests
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
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
          // If already refreshing, queue the request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: () => resolve(this.client(originalRequest)),
                reject,
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Call refresh endpoint - cookies will be updated automatically
            await this.client.get('/auth/refresh');

            // Process all queued requests
            this.failedQueue.forEach((prom) => prom.resolve());
            this.failedQueue = [];

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, reject all queued requests
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];

            // Redirect to login
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

  /**
   * Make a generic HTTP request
   */
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  public get<T = null>(url: string, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST request
   */
  public post<T = null>(url: string, data?: any, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT request
   */
  public put<T = null>(url: string, data?: any, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * DELETE request
   */
  public delete<T = null>(url: string, config?: any): Promise<SuccessResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Handle axios errors and convert to ApiErrorDetails
   */
  private handleError(error: any): ApiErrorDetails {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ErrorResponse;
      const errorDetails: ApiErrorDetails = {
        message: response?.message || error.message || 'An unknown error occurred',
        status_code: error.response?.status || 500,
        error: response?.error || 'UNKNOWN_ERROR',
        data: response?.data,
      };
      throw errorDetails;
    }

    // Non-axios error
    throw {
      message: error.message || 'An unknown error occurred',
      status_code: 500,
      error: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Check if user needs to re-login based on error
   */
  public needsRelogin(error: any): boolean {
    return error?.status_code === 401;
  }
}

export const apiClient = new ApiClient();