import { apiClient } from './apiClient';
import {
  SuccessResponse,
  ResponseCategoryData,
  SetCategoriesUsers,
  UpdateCategoriesUsers,
  CreateCategoryData,
  AddSubcategoriesToCategorySchema,
  TodayNewsResponse,
} from '../types/api.types';

class NewsService {
  // Categories APIs
  async setUserCategories(
    categoriesData: SetCategoriesUsers
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/set/categories', categoriesData);
  }

  async updateUserCategories(
    categoriesData: UpdateCategoriesUsers
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.put<ResponseCategoryData[]>('/news/update/categories', categoriesData);
  }

  async getUserCategories(): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.get<ResponseCategoryData[]>('/news/get/my-categories');
  }

  async createCustomCategory(
    categoryData: CreateCategoryData
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/create/category', categoryData);
  }

  async addSubcategoriesToCategory(
    payload: AddSubcategoriesToCategorySchema
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/add-subcategories', payload);
  }

  async deleteSubcategory(subcategoryId: string): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.delete<ResponseCategoryData[]>(
      `/news/delete/subcategory/${subcategoryId}`
    );
  }

  // News APIs
  async getTodayNews(): Promise<SuccessResponse<TodayNewsResponse>> {
    return apiClient.get<TodayNewsResponse>('/news/get/news');
  }
}

export const newsService = new NewsService();