// authService.ts - UPDATE THIS

import { apiClient } from './apiClient';
import {
  SuccessResponse,
  UserCreateSchema,
  UserLogInSchema,
  UserResponseSchema,
} from '../types/api.types';

class AuthService {
  /**
   * Sign up a new user
   * Request Body:
   *   - firstName: string
   *   - lastName: string
   *   - email: string
   *   - password: string (min 8 chars)
   *
   * Response: UserResponseSchema
   */
  async signup(userData: UserCreateSchema): Promise<SuccessResponse<UserResponseSchema>> {
    return apiClient.post<UserResponseSchema>('/auth/signup', userData);
  }

  /**
   * Login user
   * Request Body:
   *   - email: string
   *   - password: string
   *
   * Response: UserResponseSchema (FIXED - was null before)
   * Side effect: Sets httpOnly cookies with access_token and refresh_token
   */
  async login(userData: UserLogInSchema): Promise<SuccessResponse<UserResponseSchema>> {
    return apiClient.post<UserResponseSchema>('/auth/login', userData);
  }

  /**
   * Logout user
   * Clears cookies and invalidates tokens
   */
  async logout(): Promise<SuccessResponse<null>> {
    return apiClient.get<null>('/auth/logout');
  }

  /**
   * Refresh access token
   * This is called automatically by the axios interceptor when access token expires.
   * The new access token is set in httpOnly cookies by the backend.
   */
  async refreshToken(): Promise<SuccessResponse<null>> {
    return apiClient.get<null>('/auth/refresh');
  }
}

export const authService = new AuthService();