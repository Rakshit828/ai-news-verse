// src/services/auth.service.ts
import { axiosInstance } from '@/lib/axiosInstance'
import type { ApiResponse } from '@/types/api.types'
import type { User, LoginPayload, SignupPayload } from '@/types/auth.types'

export const authService = {
  signup: (payload: SignupPayload) =>
    axiosInstance
      .post<ApiResponse<User>>('/auth/signup', payload)
      .then((res) => res.data),

  login: (payload: LoginPayload) =>
    axiosInstance
      .post<ApiResponse<User>>('/auth/login', payload)
      .then((res) => res.data),

  logout: () =>
    axiosInstance
      .get<ApiResponse<null>>('/auth/logout')
      .then((res) => res.data),

  refreshToken: () =>
    axiosInstance
      .get<ApiResponse<null>>('/auth/refresh')
      .then((res) => res.data),
}
