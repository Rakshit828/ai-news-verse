// src/lib/axiosInstance.ts
import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive httponly cookies
  headers: { 'Content-Type': 'application/json' },
})

// Track if we're currently refreshing to avoid loops
let isRefreshing = false
let failedQueue: {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only attempt refresh on 401 errors (not on the refresh endpoint itself)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue additional requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axiosInstance.get('/auth/refresh')
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        // Clear auth state and redirect to login
        // Import lazily to avoid circular dependency
        const { useAuthStore } = await import('@/store/authStore')
        useAuthStore.getState().clearUser()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
