// src/types/news.types.ts

// ─── Category / Subcategory ───────────────────────────────────────────────────

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

export interface CategoriesDataResponse {
  categories: Category[];
}

// Payloads for setting / updating user categories
// Schema shows SetUsersCategoryModel: { categories: string[] } (array of subcategory IDs)
export interface SetUserCategoriesPayload {
  categories: string[];
}

export interface UpdateUserCategoriesPayload {
  categories: string[];
}

// ─── News / Articles ──────────────────────────────────────────────────────────

export type NewsSource = "GOOGLE" | "ANTHROPIC" | "OPENAI" | "HACKERNOON";

export interface NewsResponse {
  id: string;
  title: string;
  url: string;
  source: NewsSource;
  summary: string | null;
  published_on: string;
  metadatas: Record<string, any> | null;
  featured_image: string | null;
  subcategory: SubCategory;
}

export interface PaginatedGetNewsResponse {
  limit: number;
  next_cursor: Record<string, any> | null;
  news: NewsResponse[];
}

export interface GetNewsParams {
  cutoff: number;
  subcats?: string[];
  sources?: string[];
  limit?: number;
  id?: string;
  next_published_on?: string;
}

// ─── WebSocket Live Notification ──────────────────────────────────────────────

/** Shape of the JSON message pushed over the WebSocket (matches backend NewNewsNotification) */
export interface LiveNewsNotification {
  guid: string;
  title: string;
  link: string;
  source: string;
  category_id: string | null;
  subcategory_id: string;
  description: string | null;
  summary: string | null;
}
