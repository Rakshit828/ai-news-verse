// src/services/news.service.ts
import { axiosInstance } from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type {
  CategoriesDataResponse,
  SetUserCategoriesPayload,
  UpdateUserCategoriesPayload,
  PaginatedGetNewsResponse,
  GetNewsParams,
} from "@/types/news.types";

const BASE_PATH = "news";

export const newsService = {
  /** GET /api/v1/news/category — all app-defined categories */
  getCategories: () =>
    axiosInstance
      .get<ApiResponse<CategoriesDataResponse>>(`${BASE_PATH}/category`)
      .then((res) => res.data),

  /** GET /api/v1/news/category/me — categories selected by the logged-in user */
  getUserCategories: () =>
    axiosInstance
      .get<ApiResponse<CategoriesDataResponse>>(`${BASE_PATH}/category/me`)
      .then((res) => res.data),

  /** POST /api/v1/news/category — set user's categories */
  setUserCategories: (payload: SetUserCategoriesPayload) =>
    axiosInstance
      .post<ApiResponse<CategoriesDataResponse>>(`${BASE_PATH}/category`, payload)
      .then((res) => res.data),

  /** PUT /api/v1/news/category — update user's existing category selection */
  updateUserCategories: (payload: UpdateUserCategoriesPayload) =>
    axiosInstance
      .put<ApiResponse<CategoriesDataResponse>>(`${BASE_PATH}/category`, payload)
      .then((res) => res.data),

  /** GET /api/v1/news/today — today's news articles with pagination */
  getTodayNews: (params: GetNewsParams) =>
    axiosInstance
      .get<ApiResponse<PaginatedGetNewsResponse>>(`${BASE_PATH}/today`, { params })
      .then((res) => res.data),
};
