// Types
export interface Subcategory {
  subcategory_id: string;
  title: string;
}

export interface Category {
  category_id: string;
  title: string;
  subcategories: Subcategory[];
}


export interface CategoriesData {
  categories: Category[];
}


export interface NewsItem {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  subcategory: string;
}

// Types for API request
export interface SetCategorySchema {
  category_id: string;
  subcategories: string[];
}

export interface SetCategoriesUsers {
  categories_data: SetCategorySchema[];
}


export interface SingleNews{
  title: string;
  url: string;
  description: string;
  category: string;
  subcategory: string
}

export interface TodayNewsResponse {
  google: SingleNews[];
  anthropic: SingleNews[];
  openai: SingleNews[];
}


export interface GetMyCategoriesResponse{
  subcategories: string[];
}

export interface SetMyCategoriesResponse{
  subcategories: string[];
}