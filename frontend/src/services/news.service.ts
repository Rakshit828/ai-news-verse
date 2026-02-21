// src/services/news.service.ts
import { axiosInstance } from '@/lib/axiosInstance'
import type { ApiResponse } from '@/types/api.types'
import type {
  CategoryDataResponse,
  SetUserCategoriesPayload,
  UpdateUserCategoriesPayload,
  CreateCustomCategoryPayload,
  CreateCustomSubcategoryPayload,
  CategoryAlreadyExistsResponse,
  SimilarCategoryExistsResponse,
  SubcategoryAlreadyExistsResponse,
  SimilarSubcategoryExistsResponse,
  TodayNewsResponse,
} from '@/types/news.types'

// Union response types for custom category / subcategory endpoints
type CreateCategoryResult =
  | ApiResponse<CategoryDataResponse>
  | ApiResponse<CategoryAlreadyExistsResponse>
  | ApiResponse<SimilarCategoryExistsResponse>

type CreateSubcategoryResult =
  | ApiResponse<CategoryDataResponse>
  | ApiResponse<SubcategoryAlreadyExistsResponse>
  | ApiResponse<SimilarSubcategoryExistsResponse>

export const newsService = {
  /** GET /news/category — all app-defined categories (no auth required) */
  getCategories: () =>
    axiosInstance
      .get<ApiResponse<CategoryDataResponse>>('/news/category')
      .then((res) => res.data),

  /** GET /news/category/me — categories selected by the logged-in user */
  getUserCategories: () =>
    axiosInstance
      .get<ApiResponse<CategoryDataResponse>>('/news/category/me')
      .then((res) => res.data),

  /** POST /news/category — set user's categories for the first time */
  setUserCategories: (payload: SetUserCategoriesPayload) =>
    axiosInstance
      .post<ApiResponse<CategoryDataResponse>>('/news/category', payload)
      .then((res) => res.data),

  /** PUT /news/category — update user's existing category selection */
  updateUserCategories: (payload: UpdateUserCategoriesPayload) =>
    axiosInstance
      .put<ApiResponse<CategoryDataResponse>>('/news/category', payload)
      .then((res) => res.data),

  /** POST /news/category/custom — create a new custom category */
  createCustomCategory: (payload: CreateCustomCategoryPayload) =>
    axiosInstance
      .post<CreateCategoryResult>('/news/category/custom', payload)
      .then((res) => res.data),

  /** POST /news/subcategory/custom — add a subcategory to an existing category */
  createCustomSubcategory: (payload: CreateCustomSubcategoryPayload) =>
    axiosInstance
      .post<CreateSubcategoryResult>('/news/subcategory/custom', payload)
      .then((res) => res.data),

  /** GET /news/today — today's news articles for the user's selected categories */
  getTodayNews: () =>
    axiosInstance
      .get<ApiResponse<TodayNewsResponse>>('/news/today')
      .then((res) => res.data),
}
