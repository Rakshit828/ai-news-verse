// src/hooks/useNews.ts
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { newsService } from "@/services/news.service";
import { useCategoryStore } from "@/store/categoryStore";
import type {
  SetUserCategoriesPayload,
  UpdateUserCategoriesPayload,
  GetNewsParams,
  PaginatedGetNewsResponse,
  CategoriesDataResponse,
} from "@/types/news.types";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const newsKeys = {
  all: ["news"] as const,
  categories: () => [...newsKeys.all, "categories"] as const,
  userCategories: () => [...newsKeys.all, "userCategories"] as const,
  todayNews: () => [...newsKeys.all, "today"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All available categories */
export const useCategories = () => {
  const { categories, setCategories } = useCategoryStore();

  return useQuery({
    queryKey: newsKeys.categories(),
    queryFn: async () => {
      const res = await newsService.getCategories();
      
      // Safety check: ensure res and res.data exist
      if (!res?.data) {
        return { categories: [] };
      }

      // Handle both 'categories' and 'categories_data' for backward compatibility
      // and defensive mapping for 'id' vs 'category_id' etc.
      const rawCategories = (res.data as any).categories || (res.data as any).categories_data || [];

      const normalized = rawCategories.map((c: any) => ({
        id: c.id || c.category_id,
        name: c.name || c.title,
        subcategories: (c.subcategories || c.sub_categories || []).map((sc: any) => ({
          id: sc.id || sc.subcategory_id,
          name: sc.name || sc.title
        }))
      }));

      setCategories(normalized);
      return { categories: normalized };
    },
    initialData: categories.length > 0 ? { categories: categories } : undefined,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/** Categories the user has selected */
export const useUserCategories = () =>
  useQuery({
    queryKey: newsKeys.userCategories(),
    queryFn: async () => {
      const res = await newsService.getUserCategories();
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

/** Infinite news scrolling */
export const useInfiniteTodayNews = (params: Omit<GetNewsParams, "id" | "next_published_on">) =>
  useInfiniteQuery({
    queryKey: [...newsKeys.todayNews(), params],
    queryFn: async ({ pageParam }) => {
      // Map cursor properties to expected API parameters
      let cursorParams: any = {};
      if (pageParam && typeof pageParam === 'object') {
        const p = pageParam as any;
        cursorParams = {
          id: p.id,
          // Handle both 'created_at' from cursor and 'next_published_on' from type
          next_published_on: p.next_published_on || p.created_at,
        };
      }

      const res = await newsService.getTodayNews({
        ...params,
        ...cursorParams,
      });
      return res?.data || { news: [], limit: 10, next_cursor: null };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage: PaginatedGetNewsResponse) => {
      return lastPage?.next_cursor || undefined;
    },
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useSetCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetUserCategoriesPayload) =>
      newsService.setUserCategories(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to set categories.");
    },
  });
};

export const useUpdateCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserCategoriesPayload) =>
      newsService.updateUserCategories(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to update categories.",
      );
    },
  });
};