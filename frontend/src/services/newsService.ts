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
  // ========================================================================
  // Category Management APIs
  // ========================================================================

  /**
   * Set user categories (replaces existing categories)
   * Request Body:
   *   - categories_data: Array<{category_id, subcategories: string[]}>
   *
   * Response: Array<ResponseCategoryData>
   */
  async setUserCategories(
    categoriesData: SetCategoriesUsers
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/set/categories', categoriesData);
  }

  /**
   * Update user categories (modifies existing categories)
   * Request Body:
   *   - categories_data: Array<{category_id, subcategories: string[]}>
   *
   * Response: Array<ResponseCategoryData>
   */
  async updateUserCategories(
    categoriesData: UpdateCategoriesUsers
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.put<ResponseCategoryData[]>('/news/update/categories', categoriesData);
  }

  /**
   * Get user's selected categories with subcategories
   *
   * Response: Array<ResponseCategoryData>
   */
  async getUserCategories(): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.get<ResponseCategoryData[]>('/news/get/my-categories');
  }

  /**
   * Create a custom category
   * Request Body:
   *   - category_id: string
   *   - title: string
   *   - subcategories?: Array<{subcategory_id, title, added_by_users?: boolean}>
   *   - added_by_users?: boolean
   *
   * Response: Array<ResponseCategoryData>
   */
  async createCustomCategory(
    categoryData: CreateCategoryData
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/create/category', categoryData);
  }

  /**
   * Add subcategories to an existing category
   * Request Body:
   *   - category_id: string
   *   - subcategories: Array<{subcategory_id, title, added_by_users?: boolean}>
   *
   * Response: Array<ResponseCategoryData>
   */
  async addSubcategoriesToCategory(
    payload: AddSubcategoriesToCategorySchema
  ): Promise<SuccessResponse<ResponseCategoryData[]>> {
    return apiClient.post<ResponseCategoryData[]>('/news/add-subcategories', payload);
  }

  // ========================================================================
  // News Retrieval APIs
  // ========================================================================

  /**
   * Get today's news from all sources (Google, Anthropic, OpenAI)
   * Filters news by user's selected categories and subcategories
   *
   * Response: TodayNewsResponse
   *   {
   *     google: Array<{title, url, description, news_from: "Google News"}>,
   *     anthropic: Array<{title, url, description, news_from: "Anthropic"}>,
   *     openai: Array<{title, url, description, news_from: "Openai"}>
   *   }
   */
  async getTodayNews(): Promise<SuccessResponse<TodayNewsResponse>> {
    return apiClient.get<TodayNewsResponse>('/news/get/news');
  }
}

export const newsService = new NewsService();