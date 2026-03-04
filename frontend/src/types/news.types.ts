
// ─── Category / Subcategory ───────────────────────────────────────────────────

export interface SubCategory {
  subcategory_id: string;
  title: string;
}

export interface Category {
  category_id: string;
  title: string;
  /**
   * categories coming from the backend may not always have a list of
   * subcategories (the Pydantic model marks this field as `Optional`).
   * In practice the API serialiser produces an empty array, but the type
   * reflects the possibility of `null`/`undefined` so callers can handle
   * it safely.
   */
  subcategories?: SubCategory[] | null;
}

export interface CategoryDataResponse {
  categories_data: Category[];
}

// Payloads for setting / updating user categories
export interface SetCategoriesData {
  category_id: string;
  subcategories: string[]; // subcategory UUIDs
}

export interface SetUserCategoriesPayload {
  categories_data: SetCategoriesData[];
}

export interface UpdateUserCategoriesPayload {
  categories_data: SetCategoriesData[];
}

// ─── Custom Category / Subcategory Creation ───────────────────────────────────

export interface CreateCustomCategoryPayload {
  title: string;
}

export interface CreateCustomSubcategoryPayload {
  title: string;
  category_id: string;
}

/** Backend response when the exact category already belongs to another user */
export interface CategoryAlreadyExistsResponse {
  category_id: string;
  category_title: string;
}

/** Backend response when a semantically similar category exists */
export interface SimilarCategoryExistsResponse {
  category_id: string;
  category_title: string;
}

/** Backend response when the exact subcategory already exists */
export interface SubcategoryAlreadyExistsResponse {
  subcategory_id: string;
  subcategory_title: string;
}

/** Backend response when a semantically similar subcategory exists */
export interface SimilarSubcategoryExistsResponse {
  subcategory_id: string;
  subcategory_title: string;
}

// ─── News / Articles ──────────────────────────────────────────────────────────

export type NewsSource = "GOOGLE" | "ANTHROPIC" | "OPENAI" | "HACKERNOON";

export interface Article {
  title: string;
  url: string;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  source: NewsSource;
}

export interface TodayNewsResponse {
  google?: Article[];
  anthropic?: Article[];
  openai?: Article[];
  hackernoon?: Article[];
}
