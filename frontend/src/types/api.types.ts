// Core Response Types
export interface ResponseBase<T = null> {
  status: 'success' | 'error';
  message: string;
  status_code: number;
  data?: T | null;
  error?: string;
}

export interface SuccessResponse<T = null> extends ResponseBase<T> {
  status: 'success';
  status_code: 200 | 201;
}

export interface ErrorResponse<T = null> extends ResponseBase<T> {
  status: 'error';
  error: string;
}

// Auth Types
export interface UserResponseSchema {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  role: string;
  created_at: string;
}

export interface UserCreateSchema {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserLogInSchema {
  email: string;
  password: string;
}

export interface TokensSchema {
  access_token: string;
  refresh_token: string;
}

// News Service Types
export interface SubCategorySchema {
  subcategory_id: string;
  title: string;
}

export interface CategorySchema {
  category_id: string;
  title: string;
}

export interface CreateSubcategorySchema extends SubCategorySchema {
  added_by_users?: boolean;
}

export interface CreateCategoryData extends CategorySchema {
  subcategories?: CreateSubcategorySchema[];
  added_by_users?: boolean;
}

export interface ResponseCategoryData extends CategorySchema {
  subcategories?: SubCategorySchema[];
}

export interface SetCategorySchema {
  category_id: string;
  subcategories: string[];
}

export interface SetCategoriesUsers {
  categories_data: SetCategorySchema[];
}

export interface UpdateCategoriesUsers {
  categories_data: SetCategorySchema[];
}

export interface AddSubcategoriesToCategorySchema {
  category_id: string;
  subcategories: CreateSubcategorySchema[];
}

export interface ArticleResponse {
  title: string;
  url: string;
  description: string;
  news_from?: string;
}

export interface GoogleNewsResponse extends ArticleResponse {
  news_from: 'Google News';
}

export interface AnthropicNewsResponse extends ArticleResponse {
  news_from: 'Anthropic';
}

export interface OpenaiNewsResponse extends ArticleResponse {
  news_from: 'Openai';
}

export interface TodayNewsResponse {
  google: GoogleNewsResponse[];
  anthropic: AnthropicNewsResponse[];
  openai: OpenaiNewsResponse[];
}

// API Error Handler
export interface ApiError extends Error {
  status_code?: number;
  error?: string;
  message: string;
}