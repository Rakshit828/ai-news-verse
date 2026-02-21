// src/types/api.types.ts

/** Standard success envelope from the backend */
export interface ApiResponse<T> {
  status: 'success'
  message: string
  status_code: number
  data: T
}

/** Standard error envelope from the backend */
export interface ApiError {
  status: 'error'
  message: string
  status_code: number
  error: string
}
