import { apiClient } from './apiClient';
import {
  SuccessResponse,
  UserCreateSchema,
  UserLogInSchema,
  UserResponseSchema,
  TokensSchema,
} from '../types/api.types';

class AuthService {
  async signup(userData: UserCreateSchema): Promise<SuccessResponse<UserResponseSchema>> {
    return apiClient.post<UserResponseSchema>('/auth/signup', userData);
  }

  async login(userData: UserLogInSchema): Promise<SuccessResponse<null>> {
    const response = await apiClient.post<null>('/auth/login', userData);
    // Store tokens if provided
    if (response.data) {
      const tokens = response.data as any as TokensSchema;
      if (tokens.access_token) {
        apiClient.setTokens(tokens);
      }
    }
    return response;
  }

  async logout(): Promise<SuccessResponse<null>> {
    const response = await apiClient.get<null>('/auth/logout');
    apiClient.clearTokens();
    return response;
  }

  async refreshToken(): Promise<SuccessResponse<null>> {
    return apiClient.get<null>('/auth/refresh');
  }

  isAuthenticated(): boolean {
    return !!apiClient.getAccessToken();
  }
}

export const authService = new AuthService();